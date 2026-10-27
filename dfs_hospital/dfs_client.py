import hashlib
import os
import sys
import grpc
import dfs_pb2
import dfs_pb2_grpc
import net_config

CHUNK_SIZE = int(os.environ.get("DFS_CHUNK_SIZE", 64 * 1024))
CLOCK_FILE = ".dfs_client_clock"

def sha256(data):
    return hashlib.sha256(data).hexdigest()

def load_clock():
    try:
        with open(CLOCK_FILE) as f:
            return int(f.read().strip())
    except (OSError, ValueError):
        return 0

def save_clock(value):
    with open(CLOCK_FILE, "w") as f:
        f.write(str(value))

def meta_channel():
    return grpc.insecure_channel(net_config.resolve("dfs-meta"))

def put(path):
    filename = os.path.basename(path)
    with open(path, "rb") as f:
        data = f.read()
    pieces = [data[i:i + CHUNK_SIZE] for i in range(0, len(data), CHUNK_SIZE)] or [b""]
    clock = load_clock() + 1

    try:
        with meta_channel() as channel:
            meta = dfs_pb2_grpc.DfsMetadataServiceStub(channel)
            reply = meta.AllocateFile(dfs_pb2.DfsAllocateRequest(
                filename=filename, num_chunks=len(pieces), lamport_timestamp=clock), timeout=5)
            if not reply.ok:
                print(f"Upload failed: {reply.message}")
                return
            clock = max(clock, reply.lamport_timestamp) + 1
            print(f"Allocated '{filename}' as version {reply.version}: {len(data)} bytes in {len(pieces)} chunk(s)")

            committed = []
            for plan in reply.plan:
                piece = pieces[plan.index]
                digest = sha256(piece)
                stored_on = []
                for node_id, addr in zip(plan.node_ids, plan.addresses):
                    try:
                        with grpc.insecure_channel(addr) as sch:
                            ack = dfs_pb2_grpc.DfsStorageServiceStub(sch).PutChunk(
                                dfs_pb2.DfsChunkData(chunk_id=plan.chunk_id, data=piece, sha256=digest), timeout=5)
                            if ack.ok:
                                stored_on.append(node_id)
                    except grpc.RpcError as e:
                        print(f"  Chunk {plan.index}: {node_id} unreachable ({e.code().name})")

                if not stored_on:
                    print(f"Upload failed: Chunk {plan.index} could not be stored on any node.")
                    return
                committed.append(dfs_pb2.DfsChunkPlan(index=plan.index, chunk_id=plan.chunk_id, sha256=digest, node_ids=stored_on))
                print(f"  Chunk {plan.index}: stored on {', '.join(stored_on)}")

            done = meta.CommitFile(dfs_pb2.DfsCommitRequest(
                filename=filename, version=reply.version, size=len(data),
                sha256=sha256(data), chunks=committed), timeout=5)
            clock = max(clock, done.lamport_timestamp) + 1
            save_clock(clock)
            if done.ok:
                print(f"SUCCESS: Committed '{filename}' v{reply.version}. Whole-file Checksum: {sha256(data)[:16]}...")
            else:
                print(f"Commit failed: {done.message}")
    except grpc.RpcError as e:
        print(f"Cannot reach Metadata Server: {e.code().name}")

def get(filename, out_path):
    try:
        with meta_channel() as channel:
            info = dfs_pb2_grpc.DfsMetadataServiceStub(channel).GetFileInfo(
                dfs_pb2.DfsFileQuery(filename=filename), timeout=5)
        if not info.found:
            print(f"No file named '{filename}' found in hospital store.")
            return
        print(f"Reading '{filename}' v{info.version}: {info.size} bytes in {len(info.chunks)} chunk(s)")

        parts = []
        for chunk in sorted(info.chunks, key=lambda c: c.index):
            data = None
            for node_id, addr in zip(chunk.node_ids, chunk.addresses):
                if not addr:
                    continue
                try:
                    with grpc.insecure_channel(addr) as sch:
                        reply = dfs_pb2_grpc.DfsStorageServiceStub(sch).GetChunk(
                            dfs_pb2.DfsChunkId(chunk_id=chunk.chunk_id), timeout=3)
                except grpc.RpcError as e:
                    print(f"  Chunk {chunk.index}: {node_id} unavailable ({e.code().name}), trying next replica...")
                    continue

                if sha256(reply.data) != chunk.sha256:
                    print(f"  Chunk {chunk.index}: {node_id} returned CORRUPT data, trying next replica...")
                    continue

                data = reply.data
                print(f"  Chunk {chunk.index}: retrieved from {node_id}")
                break

            if data is None:
                print(f"Read failed: No healthy replica for chunk {chunk.index}.")
                return
            parts.append(data)

        blob = b"".join(parts)
        if sha256(blob) != info.sha256:
            print("Read failed: Whole-file SHA256 checksum does not match!")
            return
        with open(out_path, "wb") as f:
            f.write(blob)
        print(f"SUCCESS: Wrote {len(blob)} bytes to {out_path}, checksum fully verified.")
    except grpc.RpcError as e:
        print(f"Cannot reach Metadata Server: {e.code().name}")

def status():
    try:
        with meta_channel() as channel:
            reply = dfs_pb2_grpc.DfsMetadataServiceStub(channel).ClusterStatus(dfs_pb2.DfsStatusRequest(), timeout=5)
        print("Hospital Storage Nodes:")
        for n in reply.nodes:
            state = "UP " if n.alive else "DOWN"
            print(f"  {n.node_id} [{state}] @ {n.address} | Chunks: {n.chunk_count}")
        print("Medical Files:")
        if not reply.files:
            print("  (none)")
        for f in reply.files:
            print(f"  {f.filename} v{f.version} ({f.size} bytes, {len(f.chunks)} chunks)")
            for c in sorted(f.chunks, key=lambda c: c.index):
                where = ", ".join(f"{nid}{'' if up else ' (down)'}" for nid, up in zip(c.node_ids, c.alive))
                print(f"    Chunk {c.index}: {where}")
    except grpc.RpcError as e:
        print(f"Cannot reach Metadata Server: {e.code().name}")

if __name__ == "__main__":
    args = sys.argv[1:]
    if len(args) == 2 and args[0] == "put":
        put(args[1])
    elif len(args) == 3 and args[0] == "get":
        get(args[1], args[2])
    elif len(args) == 1 and args[0] == "status":
        status()
    else:
        print("Usage:\n  python dfs_client.py put <filepath>\n  python dfs_client.py get <filename> <dest_path>\n  python dfs_client.py status")