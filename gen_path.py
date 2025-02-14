import os

def generate_directory_structure(root_dir, indent=""):
	""" Recursively prints the directory structure from root_dir """
	try:
		entries = sorted(os.listdir(root_dir))  # Sort for consistent output
		for i, entry in enumerate(entries):
			if (entry == "node_modules" or entry.startswith(".")):
				continue
			entry_path = os.path.join(root_dir, entry)
			is_last = (i == len(entries) - 1)

			# Formatting for tree-like output
			prefix = "└── " if is_last else "├── "
			print(indent + prefix + entry)

			# Recursively process directories
			if os.path.isdir(entry_path):
				new_indent = indent + ("    " if is_last else "│   ")
				generate_directory_structure(entry_path, new_indent)

	except PermissionError:
		print(indent + "└── [Permission Denied]")

if __name__ == "__main__":
	root_directory = input("Enter the root directory path: ").strip()
	
	if os.path.isdir(root_directory):
		print(root_directory)
		generate_directory_structure(root_directory)
	else:
		print("Invalid directory path.")
