import os

file_path = "/workspaces/SistemaDeInventariosSC/requirements.txt"
if os.path.isfile(file_path):
    print("requirements.txt existe")
else:
    print("requirements.txt NO existe")
