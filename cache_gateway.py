import sys
import json
import grpc
import redis
import hospital_pb2
import hospital_pb2_grpc

REDIS_HOST = "localhost"
REDIS_PORT = 6379
CACHE_TTL_SECONDS = 10  # Fresh cache TTL
BACKEND_SERVICE_ADDR = "localhost:50051"

FRESH_KEY_PREFIX = "fresh:patient:"
STALE_KEY_PREFIX = "stale:patient:"

def get_redis():
    """Create a short-timeout connection to fail fast if Redis is down."""
    return redis.Redis(
        host=REDIS_HOST, port=REDIS_PORT,
        socket_connect_timeout=1, socket_timeout=1
    )

def fetch_from_backend(patient_id):
    """Direct gRPC call to primary hospital backend server."""
    with grpc.insecure_channel(BACKEND_SERVICE_ADDR) as channel:
        stub = hospital_pb2_grpc.PatientRecordServiceStub(channel)
        res = stub.GetPatientRecord(hospital_pb2.PatientQuery(patient_id=patient_id), timeout=2)
        return {
            "patient_id": res.patient_id,
            "name": res.name,
            "diagnosis": res.diagnosis,
            "ward": res.ward
        }

def get_patient_record(patient_id):
    fresh_key = f"{FRESH_KEY_PREFIX}{patient_id}"
    stale_key = f"{STALE_KEY_PREFIX}{patient_id}"

    # 1. Try fresh cache
    try:
        r = get_redis()
        cached = r.get(fresh_key)
        if cached:
            print(f"[Gateway] CACHE HIT for Patient #{patient_id}")
            return json.loads(cached), "cache-hit"
        print(f"[Gateway] CACHE MISS for Patient #{patient_id} -- querying backend")
    except redis.exceptions.RedisError as e:
        print(f"[Gateway] REDIS UNAVAILABLE ({e}) -- falling back to backend directly")
        r = None

    # 2. Query backend on cache miss or Redis failure
    try:
        data = fetch_from_backend(patient_id)
        print(f"[Gateway] Fetched Patient #{patient_id} from BACKEND")

        if r is not None:
            try:
                # Store fresh copy with TTL and permanent copy for stale fallback
                r.set(fresh_key, json.dumps(data), ex=CACHE_TTL_SECONDS)
                r.set(stale_key, json.dumps(data))
            except redis.exceptions.RedisError:
                print("[Gateway] Redis write failed; continuing without caching")
        return data, "backend"

    except grpc.RpcError as e:
        # 3. Backend is down: check for stale cached fallback
        print(f"[Gateway] BACKEND UNAVAILABLE ({e.code()}) -- checking for stale cache")
        if r is not None:
            try:
                stale = r.get(stale_key)
                if stale:
                    print(f"[Gateway] Serving STALE cached copy for Patient #{patient_id}")
                    return json.loads(stale), "stale-fallback"
            except redis.exceptions.RedisError:
                pass
        raise RuntimeError(f"Patient #{patient_id} unavailable: both backend and cache failed")

if __name__ == '__main__':
    pid = int(sys.argv[1]) if len(sys.argv) > 1 else 1
    data, source = get_patient_record(pid)
    print(f"\nResult (source={source}): {data}")