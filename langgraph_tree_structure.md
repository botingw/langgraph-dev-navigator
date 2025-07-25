below are langgraph/docs/docs/ tree structure (for documents). code in langgraph/example/ almost moved into  langgraph/docs/docs/ so no need to search files in it.

langgraph/docs/docs/
├── adopters.md
├── agents
│   ├── agents.md
│   ├── assets
│   │   ├── agent.png
│   │   ├── base-chat-ui.mp4
│   │   ├── fast_parrot.png
│   │   ├── interrupt-chat-ui.mp4
│   │   ├── mcp.png
│   │   ├── memory.png
│   │   ├── react_agent_graphs
│   │   │   ├── 0000.svg
│   │   │   ├── 0001.svg
│   │   │   ├── 0010.svg
│   │   │   ├── 0011.svg
│   │   │   ├── 0100.svg
│   │   │   ├── 0101.svg
│   │   │   ├── 0110.svg
│   │   │   ├── 0111.svg
│   │   │   ├── 1000.svg
│   │   │   ├── 1001.svg
│   │   │   ├── 1010.svg
│   │   │   ├── 1011.svg
│   │   │   ├── 1100.svg
│   │   │   ├── 1101.svg
│   │   │   ├── 1110.svg
│   │   │   └── 1111.svg
│   │   ├── summary.png
│   │   ├── supervisor.png
│   │   └── swarm.png
│   ├── context.md
│   ├── deployment.md
│   ├── evals.md
│   ├── human-in-the-loop.md
│   ├── mcp.md
│   ├── memory.md
│   ├── models.md
│   ├── multi-agent.md
│   ├── overview.md
│   ├── prebuilt.md
│   ├── run_agents.md
│   ├── streaming.md
│   ├── tools.md
│   └── ui.md
├── assets
│   └── react-agent-graphs.json
├── cloud
│   ├── concepts
│   │   ├── cron_jobs.md
│   │   ├── runs.md
│   │   ├── streaming.md
│   │   ├── threads.md
│   │   └── webhooks.md
│   ├── deployment
│   │   ├── cloud.md
│   │   ├── custom_docker.md
│   │   ├── graph_rebuild.md
│   │   ├── img
│   │   │   ├── langgraph_studio.png
│   │   │   └── quick_start_studio.png
│   │   ├── self_hosted_control_plane.md
│   │   ├── self_hosted_data_plane.md
│   │   ├── semantic_search.md
│   │   ├── setup_javascript.md
│   │   ├── setup_pyproject.md
│   │   ├── setup.md
│   │   └── standalone_container.md
│   ├── how-tos
│   │   ├── add-human-in-the-loop.md
│   │   ├── background_run.md
│   │   ├── clone_traces_studio.md
│   │   ├── configurable_headers.md
│   │   ├── configuration_cloud.md
│   │   ├── cron_jobs.md
│   │   ├── datasets_studio.md
│   │   ├── enqueue_concurrent.md
│   │   ├── generative_ui_react.md
│   │   ├── human_in_the_loop_breakpoint.md
│   │   ├── human_in_the_loop_review_tool_calls.md
│   │   ├── human_in_the_loop_time_travel.md
│   │   ├── img
│   │   │   ├── click_create_assistant.png
│   │   │   ├── create_assistant_view.png
│   │   │   ├── create_assistant.png
│   │   │   ├── create_new_version.png
│   │   │   ├── edit_created_assistant.png
│   │   │   ├── generative_ui_sample.jpg
│   │   │   ├── run_in_studio.png
│   │   │   ├── see_new_version.png
│   │   │   ├── see_version_history.png
│   │   │   ├── select_different_version.png
│   │   │   ├── studio_datasets.jpg
│   │   │   ├── studio_forks_poster.png
│   │   │   ├── studio_forks.mp4
│   │   │   ├── studio_graph_with_configuration.png
│   │   │   ├── studio_input_poster.png
│   │   │   ├── studio_input.mp4
│   │   │   ├── studio_node_configuration.png
│   │   │   ├── studio_playground.png
│   │   │   ├── studio_screenshot.png
│   │   │   ├── studio_threads_poster.png
│   │   │   ├── studio_threads.mp4
│   │   │   ├── studio_usage_poster.png
│   │   │   └── studio_usage.mp4
│   │   ├── interrupt_concurrent.md
│   │   ├── invoke_studio.md
│   │   ├── iterate_graph_studio.md
│   │   ├── reject_concurrent.md
│   │   ├── rollback_concurrent.md
│   │   ├── same-thread.md
│   │   ├── stateless_runs.md
│   │   ├── streaming.md
│   │   ├── studio
│   │   │   ├── manage_assistants.md
│   │   │   └── quick_start.md
│   │   ├── threads_studio.md
│   │   ├── use_stream_react.md
│   │   ├── use_threads.md
│   │   └── webhooks.md
│   ├── quick_start.md
│   ├── reference
│   │   ├── api
│   │   │   ├── api_ref_control_plane.html
│   │   │   ├── api_ref.html
│   │   │   ├── api_ref.md
│   │   │   ├── openapi_control_plane.json
│   │   │   └── openapi.json
│   │   ├── cli.md
│   │   ├── env_var.md
│   │   └── sdk
│   │       └── python_sdk_ref.md
│   └── sdk
│       └── img
│           ├── graph_diagram.png
│           └── thread_diagram.png
├── concepts
│   ├── agentic_concepts.md
│   ├── application_structure.md
│   ├── assistants.md
│   ├── auth.md
│   ├── breakpoints.md
│   ├── deployment_options.md
│   ├── double_texting.md
│   ├── durable_execution.md
│   ├── faq.md
│   ├── functional_api.md
│   ├── human_in_the_loop.md
│   ├── img
│   │   ├── agent_types.png
│   │   ├── agent_workflow.png
│   │   ├── assistants.png
│   │   ├── breakpoints.png
│   │   ├── byoc_architecture.png
│   │   ├── challenge.png
│   │   ├── double_texting.png
│   │   ├── human_in_the_loop
│   │   │   ├── approval.png
│   │   │   ├── approve-or-reject.png
│   │   │   ├── edit_graph_state.png
│   │   │   ├── edit-graph-state-simple.png
│   │   │   ├── forking.png
│   │   │   ├── multi-turn-conversation.png
│   │   │   ├── replay.png
│   │   │   ├── tool-call-review.png
│   │   │   └── wait_for_input.png
│   │   ├── langgraph_cloud_architecture.excalidraw
│   │   ├── langgraph_cloud_architecture.png
│   │   ├── langgraph_platform_deployment_architecture.png
│   │   ├── langgraph.png
│   │   ├── lg_platform.png
│   │   ├── lg_studio.png
│   │   ├── memory
│   │   │   ├── filter.png
│   │   │   ├── hot_path_vs_background.png
│   │   │   ├── short-vs-long.png
│   │   │   ├── summary.png
│   │   │   ├── update-instructions.png
│   │   │   ├── update-list.png
│   │   │   └── update-profile.png
│   │   ├── multi_agent
│   │   │   ├── architectures.png
│   │   │   ├── request.png
│   │   │   └── response.png
│   │   ├── persistence
│   │   │   ├── checkpoints_full_story.jpg
│   │   │   ├── checkpoints.jpg
│   │   │   ├── get_state.jpg
│   │   │   ├── re_play.png
│   │   │   └── shared_state.png
│   │   ├── self_hosted_control_plane_architecture.png
│   │   ├── self_hosted_data_plane_architecture.png
│   │   ├── subgraph.png
│   │   └── tool_call.png
│   ├── langgraph_cli.md
│   ├── langgraph_cloud.md
│   ├── langgraph_components.md
│   ├── langgraph_control_plane.md
│   ├── langgraph_data_plane.md
│   ├── langgraph_platform.md
│   ├── langgraph_self_hosted_control_plane.md
│   ├── langgraph_self_hosted_data_plane.md
│   ├── langgraph_server.md
│   ├── langgraph_standalone_container.md
│   ├── langgraph_studio.md
│   ├── low_level.md
│   ├── memory.md
│   ├── multi_agent.md
│   ├── persistence.md
│   ├── plans.md
│   ├── pregel.md
│   ├── scalability_and_resilience.md
│   ├── sdk.md
│   ├── server-mcp.md
│   ├── streaming.md
│   ├── subgraphs.md
│   ├── template_applications.md
│   ├── time-travel.md
│   ├── tools.md
│   └── why-langgraph.md
├── how-tos
│   ├── auth
│   │   ├── custom_auth.md
│   │   └── openapi_security.md
│   ├── autogen-integration-functional.ipynb
│   ├── autogen-integration.ipynb
│   ├── autogen-langgraph-platform.ipynb
│   ├── create-react-agent-manage-message-history.ipynb
│   ├── cross-thread-persistence-functional.ipynb
│   ├── disable-streaming.ipynb
│   ├── graph-api.ipynb
│   ├── http
│   │   ├── custom_lifespan.md
│   │   ├── custom_middleware.md
│   │   └── custom_routes.md
│   ├── human_in_the_loop
│   │   ├── add-human-in-the-loop.md
│   │   ├── breakpoints.ipynb
│   │   ├── review-tool-calls.ipynb
│   │   ├── time-travel.ipynb
│   │   └── wait-user-input.ipynb
│   ├── many-tools.ipynb
│   ├── memory
│   │   └── semantic-search.ipynb
│   ├── memory.ipynb
│   ├── multi_agent.ipynb
│   ├── multi-agent-multi-turn-convo-functional.ipynb
│   ├── multi-agent-network-functional.ipynb
│   ├── persistence-functional.ipynb
│   ├── persistence.ipynb
│   ├── react_diagrams.png
│   ├── react-agent-from-scratch-functional.ipynb
│   ├── react-agent-from-scratch.ipynb
│   ├── react-agent-structured-output.ipynb
│   ├── review-tool-calls-functional.ipynb
│   ├── run-id-langsmith.ipynb
│   ├── streaming.md
│   ├── subgraph.ipynb
│   ├── tool-calling.ipynb
│   ├── ttl
│   │   └── configure_ttl.md
│   ├── use-functional-api.md
│   ├── use-remote-graph.md
│   └── wait-user-input-functional.ipynb
├── index.md
├── llms-txt-overview.md
├── llms.txt
├── reference
│   ├── agents.md
│   ├── cache.md
│   ├── channels.md
│   ├── checkpoints.md
│   ├── config.md
│   ├── constants.md
│   ├── errors.md
│   ├── func.md
│   ├── graphs.md
│   ├── index.md
│   ├── mcp.md
│   ├── pregel.md
│   ├── remote_graph.md
│   ├── store.md
│   ├── supervisor.md
│   ├── swarm.md
│   └── types.md
├── static
│   ├── favicon.png
│   ├── values_vs_updates.png
│   ├── wordmark_dark.svg
│   └── wordmark_light.svg
├── stylesheets
│   ├── agent_graph_widget.css
│   ├── logos.css
│   ├── navigation_title_ovverides.css
│   ├── sticky_navigation.css
│   └── version_admonitions.css
├── troubleshooting
│   ├── errors
│   │   ├── GRAPH_RECURSION_LIMIT.md
│   │   ├── index.md
│   │   ├── INVALID_CHAT_HISTORY.md
│   │   ├── INVALID_CONCURRENT_GRAPH_UPDATE.md
│   │   ├── INVALID_GRAPH_NODE_RETURN_VALUE.md
│   │   ├── INVALID_LICENSE.md
│   │   └── MULTIPLE_SUBGRAPHS.md
│   ├── img
│   │   └── brave-shields.png
│   └── studio.md
└── tutorials
    ├── auth
    │   ├── add_auth_server.md
    │   ├── getting_started.md
    │   ├── img
    │   │   ├── authentication.png
    │   │   ├── authorization.png
    │   │   └── no_auth.png
    │   └── resource_auth.md
    ├── chatbot-simulation-evaluation
    │   ├── agent-simulation-evaluation.ipynb
    │   ├── langsmith-agent-simulation-evaluation.ipynb
    │   └── simulation_utils.py
    ├── chatbots
    │   └── information-gather-prompting.ipynb
    ├── code_assistant
    │   └── langgraph_code_assistant.ipynb
    ├── customer-support
    │   ├── customer-support.ipynb
    │   └── img
    │       ├── customer-support-bot-4.png
    │       ├── part-1-diagram.png
    │       ├── part-2-diagram.png
    │       ├── part-3-diagram.png
    │       └── part-4-diagram.png
    ├── deployment.md
    ├── extraction
    │   └── retries.ipynb
    ├── get-started
    │   ├── 1-build-basic-chatbot.md
    │   ├── 2-add-tools.md
    │   ├── 3-add-memory.md
    │   ├── 4-human-in-the-loop.md
    │   ├── 5-customize-state.md
    │   ├── 6-time-travel.md
    │   ├── basic-chatbot.png
    │   └── chatbot-with-tools.png
    ├── langgraph-platform
    │   └── local-server.md
    ├── lats
    │   └── lats.ipynb
    ├── llm-compiler
    │   ├── LLMCompiler.ipynb
    │   ├── math_tools.py
    │   └── output_parser.py
    ├── multi_agent
    │   ├── agent_supervisor.ipynb
    │   ├── hierarchical_agent_teams.ipynb
    │   └── multi-agent-collaboration.ipynb
    ├── overview.md
    ├── plan-and-execute
    │   └── plan-and-execute.ipynb
    ├── rag
    │   ├── langgraph_adaptive_rag_local.ipynb
    │   ├── langgraph_adaptive_rag.ipynb
    │   ├── langgraph_agentic_rag.ipynb
    │   ├── langgraph_crag_local.ipynb
    │   ├── langgraph_crag.ipynb
    │   ├── langgraph_self_rag_local.ipynb
    │   └── langgraph_self_rag.ipynb
    ├── reflection
    │   └── reflection.ipynb
    ├── reflexion
    │   └── reflexion.ipynb
    ├── rewoo
    │   └── rewoo.ipynb
    ├── self-discover
    │   └── self-discover.ipynb
    ├── sql-agent.ipynb
    ├── tnt-llm
    │   ├── img
    │   │   └── tnt_llm.png
    │   └── tnt-llm.ipynb
    ├── tot
    │   ├── img
    │   │   └── tot.png
    │   └── tot.ipynb
    ├── usaco
    │   ├── img
    │   │   ├── benchmark.png
    │   │   ├── diagram-part-1.png
    │   │   ├── diagram-part-2.png
    │   │   ├── diagram.png
    │   │   └── usaco.png
    │   └── usaco.ipynb
    ├── web-navigation
    │   ├── img
    │   │   └── web-voyager.excalidraw.jpg
    │   ├── mark_page.js
    │   └── web_voyager.ipynb
    ├── workflows
    │   └── img
    │       ├── agent.png
    │       ├── augmented_llm.png
    │       ├── evaluator_optimizer.png
    │       ├── parallelization.png
    │       ├── prompt_chain.png
    │       ├── routing.png
    │       └── worker.png
    └── workflows.md

65 directories, 343 files
