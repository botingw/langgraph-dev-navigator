import argparse
import os
import shutil
import sys

def main():
    parser = argparse.ArgumentParser(description="Install LangGraph assistant rules for your AI coding assistant.")
    parser.add_argument(
        "--rule-file",
        "-r",
        help="Rule filename in llm_onboarding_langgraph_dev_instruction (e.g., langgraph-ai-rules_v4_1.md). Defaults to langgraph-ai-rules-v2_1.md.",
    )
    parser.add_argument(
        "--workspace",
        "-w",
        default=".",
        help="Target workspace where assistant config files are written (default: current directory).",
    )
    args = parser.parse_args()

    rules_dir = "langgraph_dev/langgraph_dev_instruction/llm_onboarding_langgraph_dev_instruction"
    default_rule = "langgraph-ai-rules-v2_1.md"

    if args.rule_file:
        if "/" in args.rule_file or "\\" in args.rule_file:
            print("❌ Please provide only the rule filename, not a path.")
            sys.exit(1)
        candidate = os.path.join(rules_dir, args.rule_file)
        if not os.path.isfile(candidate):
            print(f"❌ Rule file not found: {candidate}")
            sys.exit(1)
        source_file = candidate
    else:
        source_file = os.path.join(rules_dir, default_rule)

    print(f"Using rule file: {os.path.basename(source_file)}")
    workspace_root = os.path.abspath(os.path.expanduser(args.workspace))
    print(f"Target workspace: {workspace_root}")

    assistants = {
        "Claude Code": {"path": "CLAUDE.md", "type": "shared"},
        "Codex CLI": {"path": "AGENTS.md", "type": "shared"},
        "Gemini CLI": {"path": ".gemini/GEMINI.md", "type": "shared"},
        "GitHub Copilot": {"path": ".github/copilot-instructions.md", "type": "shared"},
        "CLine": {"path": ".clinerules/langgraph-rules.md", "type": "specific"},
        "Cursor": {"path": ".cursor/rules/langgraph.mdc", "type": "specific"},
        "Roo Code": {"path": ".roo/rules/langgraph.md", "type": "specific"},
        "Windsurf": {"path": ".windsurf/rules/langgraph.md", "type": "specific"},
    }

    print("Please select your AI coding assistant:")
    options = sorted(list(assistants.keys()))
    for i, option in enumerate(options):
        print(f"  {i + 1}) {option}")
    print(f"  {len(options) + 1}) Quit")

    while True:
        try:
            choice = input(f"Enter a number (1-{len(options) + 1}): ")
            choice_index = int(choice) - 1
            if 0 <= choice_index < len(options):
                selected_assistant_name = options[choice_index]
                assistant_info = assistants[selected_assistant_name]
                dest_file = os.path.join(workspace_root, assistant_info["path"])
                assistant_type = assistant_info["type"]

                dest_dir = os.path.dirname(dest_file)
                if dest_dir:
                    os.makedirs(dest_dir, exist_ok=True)

                if assistant_type == 'shared':
                    with open(dest_file, 'a') as f:
                        with open(source_file, 'r') as sf:
                            f.write("\n\n---\n\n" + sf.read())
                    print(f"✅ Appended rules to {dest_file} for {selected_assistant_name}")
                else:  # specific
                    if os.path.exists(dest_file):
                        overwrite = input(f"Warning: '{dest_file}' already exists. Overwrite? (y/n): ").lower()
                        if overwrite != 'y':
                            print("Skipping installation.")
                            break
                    shutil.copy(source_file, dest_file)
                    print(f"✅ Installed instructions for {selected_assistant_name} at {dest_file}")
                break
            elif choice_index == len(options):
                print("Quitting.")
                break
            else:
                print("Invalid choice. Please try again.")
        except ValueError:
            print("Invalid input. Please enter a number.")

if __name__ == "__main__":
    main()
