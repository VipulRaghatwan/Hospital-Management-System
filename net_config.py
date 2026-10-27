import os

RUN_ENV = os.environ.get("RUN_ENV", "local")

LOCAL_HOSTS = {
    "A": "localhost:60401",
    "B": "localhost:60402",
    "C": "localhost:60403",
}

K8S_HOSTS = {
    "A": "raft-node-a:60401",
    "B": "raft-node-b:60402",
    "C": "raft-node-c:60403",
}

ALL_NODES = K8S_HOSTS if RUN_ENV == "k8s" else LOCAL_HOSTS