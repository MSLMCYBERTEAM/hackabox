import sys
import socket

def scan(target):
    # সিম্পল পোর্ট স্ক্যানার লজিক
    ports = [21, 22, 80, 443, 3306]
    results = []
    for port in ports:
        s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        s.settimeout(0.5)
        if s.connect_ex((target, port)) == 0:
            results.append(f"Port {port}: OPEN")
        s.close()
    return "\n".join(results) if results else "No open ports found."

if __name__ == "__main__":
    target_ip = sys.argv[1]
    print(scan(target_ip))