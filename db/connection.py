from neo4j import GraphDatabase

_driver = None

def init_driver(uri: str, user: str, password: str):
    global _driver
    _driver = GraphDatabase.driver(uri, auth=(user, password))
    _driver.verify_connectivity()

def get_driver():
    if _driver is None:
        raise RuntimeError("Driver no inicializado. Llama init_driver primero.")
    return _driver

def close_driver():
    if _driver:
        _driver.close()
