below are langsmith-docs/docs/ tree structure for documents.

langsmith-docs/docs
|-- administration
|   |-- concepts
|   |   |-- index.mdx
|   |   `-- static
|   |       |-- org_members_settings.png
|   |       |-- org_settings_workspaces_tab.png
|   |       |-- resource_hierarchy.png
|   |       |-- resource_tags.png
|   |       |-- roles_tab_rbac.png
|   |       `-- sample_workspace.png
|   |-- how_to_guides
|   |   |-- index.md
|   |   `-- organization_management
|   |       |-- _category_.json
|   |       |-- create_account_api_key.mdx
|   |       |-- data_purging_compliance.mdx
|   |       |-- index.jsx
|   |       |-- manage_organization_by_api.mdx
|   |       |-- set_up_access_control.mdx
|   |       |-- set_up_billing.mdx
|   |       |-- set_up_organization.mdx
|   |       |-- set_up_resource_tags.mdx
|   |       |-- set_up_saml_sso.mdx
|   |       |-- set_up_scim.mdx
|   |       |-- set_up_workspace.mdx
|   |       |-- static
|   |       |   |-- assign_role.png
|   |       |   |-- create_account.png
|   |       |   |-- create_api_key.png
|   |       |   |-- create_role.png
|   |       |   |-- create_workspace.png
|   |       |   |-- delete_workspace.png
|   |       |   |-- free_tier_billing_page.png
|   |       |   |-- invite_user.png
|   |       |   |-- new_org_billing_page.png
|   |       |   |-- new_org_manage_spend.png
|   |       |   |-- organization_members_and_roles.png
|   |       |   |-- resource_tags
|   |       |   |   |-- assign_tag.png
|   |       |   |   |-- create_tag.png
|   |       |   |   |-- delete_tag.png
|   |       |   |   `-- filter_by_tags.png
|   |       |   |-- scim_okta_user_attributes.png
|   |       |   |-- select_workspace.png
|   |       |   |-- setup_billing_legacy.png
|   |       |   |-- update_business_info.png
|   |       |   |-- update_invoice_email.png
|   |       |   `-- workspace_settings.png
|   |       `-- update_business_info.mdx
|   `-- tutorials
|       |-- index.mdx
|       |-- manage_spend.mdx
|       `-- static
|           |-- P2SampleTraces.png
|           |-- invoice_investigation_v2.gif
|           |-- p1endresultinvoice_v2.png
|           |-- p1orgretention_v2.png
|           |-- p1projectretention.png
|           |-- p1usagegraph_v2.png
|           |-- p2alllimitonly_v2.png
|           |-- p2bothlimits_v2.png
|           |-- p2totalspendlimits_v2.png
|           |-- p2usagelimitsempty_v2.png
|           |-- usage_graph.png
|           `-- workspaces.png
|-- evaluation
|   |-- concepts
|   |   |-- index.mdx
|   |   `-- static
|   |       |-- agent_eval.png
|   |       |-- comparing_multiple_experiments.png
|   |       |-- comparison_view.png
|   |       |-- dataset_concept.png
|   |       |-- example_concept.png
|   |       |-- experiment_view.png
|   |       |-- langgraph_agent.png
|   |       |-- offline.png
|   |       |-- online.png
|   |       |-- rag-types.png
|   |       `-- tool_use.png
|   |-- how_to_guides
|   |   |-- analyze_single_experiment.mdx
|   |   |-- annotate_traces_inline.mdx
|   |   |-- annotation_queues.mdx
|   |   |-- async.mdx
|   |   |-- attach_user_feedback.mdx
|   |   |-- audit_evaluator_scores.mdx
|   |   |-- bind_evaluator_to_dataset.mdx
|   |   |-- compare_experiment_results.mdx
|   |   |-- create_few_shot_evaluators.mdx
|   |   |-- custom_evaluator.mdx
|   |   |-- dataset_subset.mdx
|   |   |-- dataset_version.mdx
|   |   |-- define_target.mdx
|   |   |-- download_experiment_results_as_csv.mdx
|   |   |-- evaluate_existing_experiment.mdx
|   |   |-- evaluate_llm_application.mdx
|   |   |-- evaluate_on_intermediate_steps.mdx
|   |   |-- evaluate_pairwise.mdx
|   |   |-- evaluate_with_attachments.mdx
|   |   |-- export_filtered_traces_to_dataset.mdx
|   |   |-- fetch_perf_metrics_experiment.mdx
|   |   |-- filter_experiments_ui.mdx
|   |   |-- index.md
|   |   |-- index_datasets_for_dynamic_few_shot_example_selection.mdx
|   |   |-- langchain_runnable.mdx
|   |   |-- langgraph.mdx
|   |   |-- llm_as_judge.mdx
|   |   |-- local.mdx
|   |   |-- manage_datasets_in_application.mdx
|   |   |-- manage_datasets_programmatically.mdx
|   |   |-- metric_type.mdx
|   |   |-- multi_turn_simulation.mdx
|   |   |-- multiple_scores.mdx
|   |   |-- prebuilt_evaluators.mdx
|   |   |-- pytest.mdx
|   |   |-- rate_limiting.mdx
|   |   |-- renaming_experiment.mdx
|   |   |-- repetition.mdx
|   |   |-- run_evals_api_only.mdx
|   |   |-- run_evaluation_from_prompt_playground.mdx
|   |   |-- set_up_feedback_criteria.mdx
|   |   |-- share_dataset.mdx
|   |   |-- static
|   |   |   |-- add-auto-evaluator-python.png
|   |   |   |-- add-filtered-traces-to-dataset.png
|   |   |   |-- add_manual_example.png
|   |   |   |-- add_metadata.gif
|   |   |   |-- add_to..dataset.png
|   |   |   |-- add_to_annotation_queue.png
|   |   |   |-- add_to_dataset.png
|   |   |   |-- add_to_dataset_from_aq.png
|   |   |   |-- add_to_split2.png
|   |   |   |-- add_trace_with_attachments_to_dataset.png
|   |   |   |-- adding_multimodal_variable.gif
|   |   |   |-- annotate_experiment.png
|   |   |   |-- annotate_trace_inline.png
|   |   |   |-- annotation_queue_edit.png
|   |   |   |-- annotation_queue_form.png
|   |   |   |-- annotation_sidebar.png
|   |   |   |-- attachment_editing.gif
|   |   |   |-- attachments_with_examples.png
|   |   |   |-- cat_feedback.png
|   |   |   |-- charts_tab.png
|   |   |   |-- code-autoeval-popup.png
|   |   |   |-- column_config.gif
|   |   |   |-- column_heat_map.png
|   |   |   |-- compare.gif
|   |   |   |-- compare_select.png
|   |   |   |-- compare_to_another.png
|   |   |   |-- confirmation.png
|   |   |   |-- cont_feedback.png
|   |   |   |-- corrections_comparison_view.png
|   |   |   |-- corrections_runs_table.png
|   |   |   |-- create_annotation_queue.png
|   |   |   |-- create_annotation_queue_new.png
|   |   |   |-- create_annotation_rubric.png
|   |   |   |-- create_dataset_csv.png
|   |   |   |-- create_evaluator.png
|   |   |   |-- create_example_with_attachments.png
|   |   |   |-- create_few_shot_evaluator.png
|   |   |   |-- custom_json_schema.png
|   |   |   |-- dataset_schema_definition.png
|   |   |   |-- diff_mode.png
|   |   |   |-- download_experiment_results_as_csv.png
|   |   |   |-- edit_evaluator.png
|   |   |   |-- enter_dataset_details.png
|   |   |   |-- evals-quick-start.gif
|   |   |   |-- evaluation_intermediate_experiment.png
|   |   |   |-- evaluation_intermediate_trace.png
|   |   |   |-- evaluator_prompt.png
|   |   |   |-- evaluator_run.png
|   |   |   |-- expanded_view.png
|   |   |   |-- experiment-tracing-project.png
|   |   |   |-- experiment_view.png
|   |   |   |-- experiments-tab-code-results.png
|   |   |   |-- export-dataset-button.gif
|   |   |   |-- export-filtered-trace-to-dataset.png
|   |   |   |-- few_shot_code_snippet.png
|   |   |   |-- few_shot_example.png
|   |   |   |-- few_shot_search_results.png
|   |   |   |-- few_shot_synced_empty_state.png
|   |   |   |-- few_shot_tab_unsynced.png
|   |   |   |-- filter-all-experiments.png
|   |   |   |-- filter-feedback.png
|   |   |   |-- filter-openai.png
|   |   |   |-- filter-singleminded.png
|   |   |   |-- filter_pairwise.png
|   |   |   |-- filter_to_regressions.png
|   |   |   |-- filtered-traces-from-experiment.png
|   |   |   |-- filters_applied.png
|   |   |   |-- generate_synthetic_examples_create.png
|   |   |   |-- generate_synthetic_examples_pane.png
|   |   |   |-- group_by.gif
|   |   |   |-- heat_map.gif
|   |   |   |-- heatmap.png
|   |   |   |-- input_variables_playground.png
|   |   |   |-- jest_vitest_reporter_output.png
|   |   |   |-- metadata_in_charts.png
|   |   |   |-- modify_example.png
|   |   |   |-- multi_select_annotation_queue.png
|   |   |   |-- multi_turn_trace.png
|   |   |   |-- multi_turn_vitest.png
|   |   |   |-- multiple_scores.png
|   |   |   |-- multiselect_add_to_dataset.png
|   |   |   |-- new_dataset.png
|   |   |   |-- open_source_trace.png
|   |   |   |-- pairwise_comparison_view.png
|   |   |   |-- pairwise_from_dataset.png
|   |   |   |-- playground_dataset.png
|   |   |   |-- playground_eval.png
|   |   |   |-- playground_evaluator.gif
|   |   |   |-- playground_evaluator_results.png
|   |   |   |-- playground_experiment.gif
|   |   |   |-- playground_experiment_results.png
|   |   |   |-- prebuilt_eval_result.png
|   |   |   |-- regression_test.gif
|   |   |   |-- regression_view.png
|   |   |   |-- rename_in_experiments_view.png
|   |   |   |-- rename_in_playground.png
|   |   |   |-- repetitions.png
|   |   |   |-- review_runs.png
|   |   |   |-- rich-pytest-outputs.png
|   |   |   |-- rubric_for_annotators.png
|   |   |   |-- runnable_eval.png
|   |   |   |-- schema_validation.png
|   |   |   |-- select_baseline.png
|   |   |   |-- select_columns.png
|   |   |   |-- select_experiment.png
|   |   |   |-- select_feedback.png
|   |   |   |-- select_metadata_key.png
|   |   |   |-- share_dataset.gif
|   |   |   |-- share_dataset.png
|   |   |   |-- show-feedback-from-autoeval-code.png
|   |   |   |-- simple-pytest-dataset.png
|   |   |   |-- simple-pytest.png
|   |   |   |-- simple-vitest.png
|   |   |   |-- sort_filter.png
|   |   |   |-- summary_eval.png
|   |   |   |-- switch_to_dataset.png
|   |   |   |-- tag_this_version.png
|   |   |   |-- toggle_views.gif
|   |   |   |-- toggle_views.png
|   |   |   |-- unshare_dataset.png
|   |   |   |-- unshare_trace_list.png
|   |   |   |-- update_display.png
|   |   |   |-- uploaded_dataset.png
|   |   |   |-- uploaded_dataset_examples.png
|   |   |   |-- uploaded_experiment.png
|   |   |   |-- use_corrections_as_few_shot.png
|   |   |   |-- version_dataset.png
|   |   |   |-- version_dataset_tests.png
|   |   |   |-- view_experiment.gif
|   |   |   |-- view_few_shot_ds.png
|   |   |   `-- view_trace.png
|   |   |-- summary.mdx
|   |   |-- upload_existing_experiments.mdx
|   |   |-- use_langchain_off_the_shelf_evaluators_old.mdx
|   |   |-- version_datasets.mdx
|   |   `-- vitest_jest.mdx
|   |-- index.mdx
|   `-- tutorials
|       |-- agents.mdx
|       |-- aligning_evaluator.mdx
|       |-- backtesting.mdx
|       |-- evaluation.mdx
|       |-- index.mdx
|       |-- rag.mdx
|       |-- static
|       |   |-- add_to_evaluator_queue.gif
|       |   |-- agent_eval.png
|       |   |-- agent_lg_overview.png
|       |   |-- agent_tutorial_graph.png
|       |   |-- alignment_evaluator_pg.gif
|       |   |-- alignment_starting_point.png
|       |   |-- answer_eval_flow.png
|       |   |-- answer_hallucination_flow.png
|       |   |-- baseline_experiment.png
|       |   |-- chinook-diagram.png
|       |   |-- comparison_view.png
|       |   |-- creating_split.mp4
|       |   |-- dataset_page.png
|       |   |-- document_relevance_flow.png
|       |   |-- enable_reasoning.gif
|       |   |-- evaluator_pg.gif
|       |   |-- qa_graph.png
|       |   |-- rag_eval_overview.png
|       |   |-- rag_overview.png
|       |   |-- refund_graph.png
|       |   |-- sql_agent_graph.png
|       |   |-- swebench_evaluation.png
|       |   |-- swebench_langsmith_feedback.png
|       |   |-- testing_tutorial_compare_metrics.png
|       |   |-- testing_tutorial_compare_runs.png
|       |   |-- testing_tutorial_dataset.png
|       |   |-- testing_tutorial_one_run.png
|       |   |-- testing_tutorial_over_time.png
|       |   |-- testing_tutorial_run.png
|       |   |-- testing_tutorial_side_panel.png
|       |   `-- testing_tutorial_three_runs.png
|       |-- swe-benchmark.mdx
|       `-- testing.mdx
|-- index.mdx
|-- langgraph_cloud.mdx
|-- observability
|   |-- concepts
|   |   |-- index.mdx
|   |   `-- static
|   |       |-- feedback.png
|   |       |-- metadata.png
|   |       |-- primitives-dark.png
|   |       |-- primitives.png
|   |       |-- project.png
|   |       |-- run.png
|   |       |-- tags.png
|   |       `-- trace.png
|   |-- how_to_guides
|   |   |-- access_current_span.mdx
|   |   |-- add_metadata_tags.mdx
|   |   |-- alerts.mdx
|   |   |-- alerts_pagerduty.mdx
|   |   |-- alerts_webhook.mdx
|   |   |-- annotate_code.mdx
|   |   |-- calculate_token_based_costs.mdx
|   |   |-- claude_code.mdx
|   |   |-- collector_proxy.mdx
|   |   |-- compare_traces.mdx
|   |   |-- dashboards.mdx
|   |   |-- data_export.mdx
|   |   |-- distributed_tracing.mdx
|   |   |-- export_traces.mdx
|   |   |-- filter_traces_in_application.mdx
|   |   |-- index.md
|   |   |-- langgraph_platform_logs.mdx
|   |   |-- log_llm_trace.mdx
|   |   |-- log_multimodal_traces.mdx
|   |   |-- log_retriever_trace.mdx
|   |   |-- log_traces_to_project.mdx
|   |   |-- mask_inputs_outputs.mdx
|   |   |-- nest_traces.mdx
|   |   |-- online_evaluations.mdx
|   |   |-- output_detailed_logs.mdx
|   |   |-- rules.mdx
|   |   |-- sample_traces.mdx
|   |   |-- serverless_environments.mdx
|   |   |-- share_trace.mdx
|   |   |-- static
|   |   |   |-- add_a_notification.png
|   |   |   |-- add_automation_rule.png
|   |   |   |-- add_chart.png
|   |   |   |-- add_dashboard.png
|   |   |   |-- agent_trace.png
|   |   |   |-- ai_query.png
|   |   |   |-- alert_metric.png
|   |   |   |-- alert_preview.png
|   |   |   |-- alert_preview_pane.png
|   |   |   |-- alerts_filter.png
|   |   |   |-- annotate_code_trace.gif
|   |   |   |-- aq_spot_check_rule.gif
|   |   |   |-- automations.png
|   |   |   |-- aws-comprehend-anonymized.png
|   |   |   |-- aws-comprehend-not-anonymized.png
|   |   |   |-- chart_filters.png
|   |   |   |-- chart_filters_for_node_decision.png
|   |   |   |-- chat_model.png
|   |   |   |-- child_runs.png
|   |   |   |-- claude_code_trace.png
|   |   |   |-- compare_metrics.png
|   |   |   |-- compare_traces
|   |   |   |   |-- compare_button.png
|   |   |   |   |-- compare_trace.png
|   |   |   |   `-- select_trace.png
|   |   |   |-- convo.png
|   |   |   |-- convo_tab.png
|   |   |   |-- copy_filter.png
|   |   |   |-- dashboard_table.png
|   |   |   |-- decision_at_node.png
|   |   |   |-- define_conditions.png
|   |   |   |-- drill_monitor.png
|   |   |   |-- evaluator_secrets.png
|   |   |   |-- expanded_chart.png
|   |   |   |-- filter.png
|   |   |   |-- filter_full_text.png
|   |   |   |-- filter_runs_in_trace_view.png
|   |   |   |-- filter_shortcuts.png
|   |   |   |-- filter_time.png
|   |   |   |-- give_rule_name.png
|   |   |   |-- hello_llm.png
|   |   |   |-- hide_inputs_outputs.png
|   |   |   |-- langchain_trace.png
|   |   |   |-- langgraph_with_langchain_trace.png
|   |   |   |-- langgraph_without_langchain_trace.png
|   |   |   |-- lgp_server_logs_filters.png
|   |   |   |-- mapping_variables.png
|   |   |   |-- modal_langsmith_secret.png
|   |   |   |-- model_costs.png
|   |   |   |-- model_price_map.png
|   |   |   |-- more_actions_bar.png
|   |   |   |-- multimodal.png
|   |   |   |-- multiple_data_series.png
|   |   |   |-- negative_filtering_1.png
|   |   |   |-- negative_filtering_2.png
|   |   |   |-- negative_filtering_3.png
|   |   |   |-- negative_filtering_4.png
|   |   |   |-- new_price_map_entry.png
|   |   |   |-- online-eval-custom-code.png
|   |   |   |-- pager_duty.png
|   |   |   |-- pagerduty_setup.png
|   |   |   |-- prebuilt.gif
|   |   |   |-- presidio-anonymized.png
|   |   |   |-- presidio-not-anonymized.png
|   |   |   |-- prompt_preview.png
|   |   |   |-- raw_query.png
|   |   |   |-- regex-anonymized.png
|   |   |   |-- regex-not-anonymized.png
|   |   |   |-- retriever_trace.png
|   |   |   |-- rule_logs.gif
|   |   |   |-- rules_filter.png
|   |   |   |-- rules_logs.png
|   |   |   |-- rules_past_runs.png
|   |   |   |-- rules_past_runs_logs.png
|   |   |   |-- run_depth_explained.png
|   |   |   |-- save_a_filter.png
|   |   |   |-- search_kv_filter_shortcut.png
|   |   |   |-- search_kv_input.png
|   |   |   |-- search_kv_output.png
|   |   |   |-- search_kv_tool.png
|   |   |   |-- search_kv_tool_tree.png
|   |   |   |-- selecting_a_filter.png
|   |   |   |-- share_trace.png
|   |   |   |-- subsets_monitor.png
|   |   |   |-- trace_arize.png
|   |   |   |-- trace_filter.png
|   |   |   |-- trace_tree_manual_tracing.png
|   |   |   |-- trace_tree_python_interop.png
|   |   |   |-- trace_with_attachments.png
|   |   |   |-- tracing_project_to_dashboard.png
|   |   |   |-- unshare_trace.png
|   |   |   |-- unshare_trace_list.png
|   |   |   |-- view_automation_rules.png
|   |   |   |-- view_evaluators.png
|   |   |   |-- view_server_logs_button.png
|   |   |   |-- webhook.png
|   |   |   |-- webhook_headers.png
|   |   |   `-- webhook_setup.png
|   |   |-- threads.mdx
|   |   |-- toubleshooting_variable_caching.mdx
|   |   |-- trace_generator_functions.mdx
|   |   |-- trace_with_api.mdx
|   |   |-- trace_with_instructor.mdx
|   |   |-- trace_with_langchain.mdx
|   |   |-- trace_with_langgraph.mdx
|   |   |-- trace_with_openai_agents_sdk.mdx
|   |   |-- trace_with_opentelemetry.mdx
|   |   |-- trace_with_vercel_ai_sdk.mdx
|   |   |-- trace_with_vercel_ai_sdk_legacy.mdx
|   |   |-- trace_without_env_vars.mdx
|   |   |-- upload_files_with_traces.mdx
|   |   `-- webhooks.mdx
|   |-- index.mdx
|   `-- tutorials
|       |-- index.mdx
|       |-- observability.mdx
|       `-- static
|           |-- tracing_tutorial_chain.png
|           |-- tracing_tutorial_feedback.png
|           |-- tracing_tutorial_filtering.png
|           |-- tracing_tutorial_metadata.png
|           |-- tracing_tutorial_metadata_filtering.png
|           |-- tracing_tutorial_monitor.png
|           |-- tracing_tutorial_monitor_drilldown.png
|           |-- tracing_tutorial_monitor_grouped.png
|           |-- tracing_tutorial_monitor_metadata.png
|           |-- tracing_tutorial_openai.png
|           `-- tracing_tutorial_retriever.png
|-- pricing
|   |-- faq.mdx
|   |-- index.md
|   `-- plans.mdx
|-- prompt_engineering
|   |-- concepts
|   |   |-- index.mdx
|   |   `-- static
|   |       |-- add_prompt_to_playground.gif
|   |       |-- commit_diff.png
|   |       |-- prompt-playground.png
|   |       |-- prompt_vs_prompt_template.png
|   |       `-- test_over_dataset_in_playground.gif
|   |-- how_to_guides
|   |   |-- create_a_prompt.mdx
|   |   |-- custom_endpoint.mdx
|   |   |-- custom_openai_compliant_model.mdx
|   |   |-- index.md
|   |   |-- langchain_hub.mdx
|   |   |-- manage_prompts_programatically.mdx
|   |   |-- managing_model_configurations.mdx
|   |   |-- multimodal_content.mdx
|   |   |-- multiple_messages.mdx
|   |   |-- open_a_prompt_from_a_trace.mdx
|   |   |-- prompt_canvas.mdx
|   |   |-- prompt_tags.mdx
|   |   |-- static
|   |   |   |-- azure_playground.png
|   |   |   |-- blank_prompts_page.png
|   |   |   |-- commit_prompt_playground.png
|   |   |   |-- create_a_prompt
|   |   |   |   |-- convert_to_variable.gif
|   |   |   |   |-- edit_prompt.png
|   |   |   |   |-- empty_playground.png
|   |   |   |   |-- pencil.png
|   |   |   |   |-- prompt_inputs.png
|   |   |   |   |-- prompt_table.png
|   |   |   |   |-- prompt_with_variable.png
|   |   |   |   |-- public_handle.png
|   |   |   |   |-- run.png
|   |   |   |   |-- save_prompt.png
|   |   |   |   |-- structured_output.png
|   |   |   |   `-- template_format.png
|   |   |   |-- create_webhook.png
|   |   |   |-- dataset_table.png
|   |   |   |-- edit_in_playground.png
|   |   |   |-- evaluator_pane.png
|   |   |   |-- extra_params.png
|   |   |   |-- extra_params_error.png
|   |   |   |-- langchain_hub.png
|   |   |   |-- manual_prompt_multimodal.png
|   |   |   |-- metadata_edit_button.png
|   |   |   |-- multiturn_diagram.png
|   |   |   |-- multiturn_from_dataset.gif
|   |   |   |-- multiturn_from_run.gif
|   |   |   |-- multiturn_manual.gif
|   |   |   |-- multiturn_manual_list.gif
|   |   |   |-- openai_proxy_provider.png
|   |   |   |-- playground_custom_model.png
|   |   |   |-- prompt_canvas_custom_quick_action.gif
|   |   |   |-- prompt_canvas_diff.gif
|   |   |   |-- prompt_canvas_open.gif
|   |   |   |-- prompt_canvas_quick_actions.gif
|   |   |   |-- prompt_canvas_rewrite.gif
|   |   |   |-- prompt_canvas_save.gif
|   |   |   |-- prompt_commits_tab.png
|   |   |   |-- prompt_playground_edit_commit.png
|   |   |   |-- prompt_settings.png
|   |   |   |-- prompt_tags
|   |   |   |   |-- commits_tab.png
|   |   |   |   |-- create_new_prompt_tag.png
|   |   |   |   `-- move_prompt_tag.png
|   |   |   |-- prompts_tab.png
|   |   |   |-- renamed_config.mp4
|   |   |   |-- run_metadata.png
|   |   |   |-- saving_config.mp4
|   |   |   |-- select_dataset.png
|   |   |   |-- set_default_config.png
|   |   |   |-- template_variable_multimodal_content.png
|   |   |   |-- tools
|   |   |   |   |-- add_tool.png
|   |   |   |   |-- custom_tool.gif
|   |   |   |   |-- tool_call.png
|   |   |   |   |-- tool_choice.png
|   |   |   |   `-- web_search_tool.gif
|   |   |   |-- trace_with_prompt_link.png
|   |   |   |-- update_prompt_form.png
|   |   |   `-- upload_inline_multimodal_content.png
|   |   |-- trigger_webhook.mdx
|   |   |-- update_a_prompt.mdx
|   |   `-- use_tools.mdx
|   |-- quickstarts
|   |   |-- quickstart_sdk.mdx
|   |   |-- quickstart_ui.mdx
|   |   `-- static
|   |       |-- create_prompt_ui.gif
|   |       |-- save_prompt_commit_ui.gif
|   |       |-- save_prompt_ui.gif
|   |       |-- tag_prompt_ui.gif
|   |       `-- test_prompt_ui.gif
|   `-- tutorials
|       |-- index.mdx
|       |-- optimize_classifier.mdx
|       |-- prompt_commit.mdx
|       `-- static
|           |-- class-optimization-neg.png
|           |-- class-optimization-pos.png
|           |-- prompt-commit-github.png
|           |-- prompt-commit-main.png
|           |-- prompt-commit-webhook.png
|           |-- prompt-excalidraw.png
|           `-- prompt-sequence-diagram.png
|-- reference
|   |-- authentication_authorization
|   |   |-- _category_.json
|   |   `-- authentication_methods.mdx
|   |-- cloud-arch.png
|   |-- cloud_architecture_and_scalability.mdx
|   |-- data_formats
|   |   |-- dataset_json_types.mdx
|   |   |-- example_data_format.mdx
|   |   |-- feedback_data_format.mdx
|   |   |-- run_data_format.mdx
|   |   `-- trace_query_syntax.mdx
|   |-- evaluation
|   |   |-- _category_.json
|   |   `-- dataset_transformations.mdx
|   |-- index.md
|   |-- regions_faq.mdx
|   `-- sdk_reference
|       `-- langchain_evaluators.mdx
|-- self_hosting
|   |-- architectural_overview.mdx
|   |-- configuration
|   |   |-- basic_auth.mdx
|   |   |-- blob_storage.mdx
|   |   |-- custom_tls_certificates.mdx
|   |   |-- external_clickhouse.mdx
|   |   |-- external_postgres.mdx
|   |   |-- external_redis.mdx
|   |   |-- index.mdx
|   |   |-- ingress.mdx
|   |   |-- mirroring_images.mdx
|   |   |-- playground_environment_settings.mdx
|   |   |-- scale.mdx
|   |   |-- sso.mdx
|   |   |-- static
|   |   |   `-- azure_playground.png
|   |   |-- ttl.mdx
|   |   |-- user_management.mdx
|   |   `-- using_an_existing_secret.mdx
|   |-- egress.mdx
|   |-- faq.mdx
|   |-- index.md
|   |-- installation
|   |   |-- docker.mdx
|   |   |-- index.md
|   |   `-- kubernetes.mdx
|   |-- langsmith_managed_clickhouse.mdx
|   |-- observability
|   |   |-- export_backend.mdx
|   |   |-- index.md
|   |   |-- langsmith_collector.mdx
|   |   `-- observability_stack.mdx
|   |-- organization_charts.mdx
|   |-- release_notes.mdx
|   |-- scripts
|   |   |-- delete_a_workspace.mdx
|   |   |-- delete_an_organization.mdx
|   |   |-- delete_traces.mdx
|   |   |-- generate_clickhouse_stats.mdx
|   |   |-- generate_query_stats.mdx
|   |   |-- index.md
|   |   |-- running_ch_support_queries.mdx
|   |   `-- running_pg_support_queries.mdx
|   |-- static
|   |   |-- langsmith_grafana_dashboards.png
|   |   |-- langsmith_managed_clickhouse_architecture.png
|   |   |-- langsmith_ui.png
|   |   |-- langsmith_ui_basic_auth.png
|   |   |-- langsmith_ui_sso.png
|   |   `-- self_hosted_architecture_diagram.png
|   |-- troubleshooting.mdx
|   |-- upgrades.mdx
|   `-- usage.mdx
`-- static
    |-- LangSmith_Diagram-GA-final.png
    |-- get_started.png
    |-- ls-diagram.png
    `-- rendered_trace.png

51 directories, 615 files
