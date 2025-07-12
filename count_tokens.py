
import os
import tiktoken

def count_tokens_in_directory(directory):
    """
    Recursively counts the tokens and number of .md and .txt files within a directory.
    """
    total_tokens = 0
    file_count = 0
    # Using cl100k_base as it's a common default for modern models
    encoding = tiktoken.get_encoding("cl100k_base")

    for root, _, files in os.walk(directory):
        for file in files:
            if file.endswith((".md", ".txt")):
                file_count += 1
                file_path = os.path.join(root, file)
                try:
                    with open(file_path, "r", encoding="utf-8") as f:
                        content = f.read()
                    num_tokens = len(encoding.encode(content))
                    total_tokens += num_tokens
                except Exception as e:
                    print(f"Could not process file {file_path}: {e}")

    return total_tokens, file_count

if __name__ == "__main__":
    target_directory = "/Users/wangbo-ting/git/langgraph-dev-navigator/langgraph/docs/docs/"
    if not os.path.isdir(target_directory):
        print(f"Error: Directory not found at {target_directory}")
    else:
        total_tokens, file_count = count_tokens_in_directory(target_directory)
        print(f"Total files (.md and .txt): {file_count}")
        print(f"Total tokens in '{target_directory}' for .md and .txt files: {total_tokens}")
