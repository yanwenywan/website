from pathlib import Path

def rename_files(folder_path):
    # Get a sorted list of all .md files in the folder
    folder = Path(folder_path)
    files = sorted([f for f in folder.iterdir() if f.is_file() and f.suffix == '.md' and f.stem[1:].isdigit()])

    for file in files:
        old_number = int(file.stem[1:])  # Extract the number from the filename
        new_number = old_number - 1  # Subtract 8 from the number
        new_filename = f"_{new_number}.md"
        new_path = folder / new_filename

        # Rename the file
        file.rename(new_path)
        print(f"Renamed: {file.name} -> {new_filename}")

# Replace 'your_folder_path' with the actual path to the folder containing the files
folder_path = "."
rename_files(folder_path)
