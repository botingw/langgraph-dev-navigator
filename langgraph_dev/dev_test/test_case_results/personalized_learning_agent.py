
from typing import TypedDict, Annotated, List
import operator

from langgraph.graph import StateGraph, END

# 1. Define the state that will be passed between nodes
class AgentState(TypedDict):
    """
    Represents the shared state of the learning platform.
    """
    student_profile: dict
    current_learning_objectives: List[str]
    new_exercise: dict
    student_response: str
    grading_results: dict
    misconceptions: List[str]
    recommendations: List[str]
    # Metrics aggregated per session for the reflection agent
    session_metrics: dict
    # Global configurations that the reflection agent can tune
    agent_configs: dict
    # Flag to control the main loop
    session_ended: bool

# 2. Define the placeholder functions for each agent (node)

def generate_exercises(state: AgentState) -> dict:
    """
    Generates a new exercise based on student profile and objectives.
    """
    print("---AGENT: ExerciseGenerator---")
    config = state['agent_configs']['exercise_generator']
    print(f"-> Using config: {config}")
    
    # Simulate generating an exercise
    difficulty = config['difficulty_range'][0]
    exercise = {
        "id": state['session_metrics']['exercise_count'] + 1,
        "topic": state['current_learning_objectives'][0],
        "difficulty": difficulty,
        "question": f"This is a {difficulty} question about {state['current_learning_objectives'][0]}."
    }
    print(f"-> Generated Exercise: {exercise['question']}")
    
    # In a real scenario, the student would now solve this.
    # For this simulation, we'll use a canned response.
    student_response = "This is the student's answer."
    
    return {"new_exercise": exercise, "student_response": student_response}

def grade_responses(state: AgentState) -> dict:
    """
    Grades the student's response.
    """
    print("---AGENT: ResponseGrader---")
    # Simulate grading
    grading_results = {
        "score": 0.85,
        "error_types": ["calculation_error"],
        "response_time": 120
    }
    print(f"-> Grading complete. Score: {grading_results['score']}")
    return {"grading_results": grading_results}

def detect_misconceptions(state: AgentState) -> dict:
    """
    Detects misconceptions from the grading details.
    """
    print("---AGENT: MisconceptionDetector---")
    misconceptions = []
    if "calculation_error" in state['grading_results']['error_types']:
        misconception = "Difficulty with basic arithmetic."
        print(f"-> Found Misconception: {misconception}")
        misconceptions.append(misconception)
    return {"misconceptions": misconceptions}

def update_model(state: AgentState) -> dict:
    """
    Updates the student's profile based on recent performance.
    """
    print("---AGENT: StudentModelUpdater---")
    profile = state['student_profile']
    profile['skill_levels']['arithmetic'] -= 0.05
    profile['learning_history'].append(state['new_exercise']['id'])
    print(f"-> Updated student skill level for 'arithmetic' to {profile['skill_levels']['arithmetic']:.2f}")
    return {"student_profile": profile}

def recommend_next(state: AgentState) -> dict:
    """
    Recommends the next learning materials.
    """
    print("---AGENT: RecommendationEngine---")
    recommendations = ["Review video on 'Basic Arithmetic'", "Practice module on 'Calculations'"]
    print(f"-> Recommendations: {', '.join(recommendations)}")
    
    # Also, update session metrics here
    metrics = state['session_metrics']
    metrics['exercise_count'] += 1
    metrics['total_score'] += state['grading_results']['score']
    
    return {"recommendations": recommendations, "session_metrics": metrics}

def detect_session_end(state: AgentState) -> dict:
    """
    Checks if the learning session should end.
    """
    print("---NODE: SessionBoundary---")
    session_ended = state['session_metrics']['exercise_count'] >= state['agent_configs']['session_boundary']['max_exercises']
    if session_ended:
        print("-> Session limit reached. Triggering reflection.")
    else:
        print("-> Session continues.")
    return {"session_ended": session_ended}

def reflect_and_optimize(state: AgentState) -> dict:
    """
    Analyzes trends and tunes parameters for other agents.
    """
    print("\n---AGENT: ReflectionAgent (End of Session)---")
    metrics = state['session_metrics']
    avg_score = metrics['total_score'] / metrics['exercise_count']
    print(f"-> Analyzing session. Average Score: {avg_score:.2f}")
    
    # Simulate parameter tuning
    new_configs = state['agent_configs']
    if avg_score < 0.8:
        print("-> Student is struggling. Lowering exercise difficulty for next session.")
        new_configs['exercise_generator']['difficulty_range'] = ["easy", "medium"]
    else:
        print("-> Student is performing well. Increasing exercise difficulty.")
        new_configs['exercise_generator']['difficulty_range'] = ["medium", "hard"]
        
    # Reset metrics for the next session
    new_session_metrics = {"exercise_count": 0, "total_score": 0}
        
    return {"agent_configs": new_configs, "session_metrics": new_session_metrics}

def ensure_content_diversity(state: AgentState) -> dict:
    """
    Ensures a variety of content is presented.
    """
    print("---AGENT: DiversityController---")
    print("-> Checking content diversity for next session...")
    # In a real system, this would adjust the content pool.
    # For now, it's a placeholder in the flow.
    return {}

# 3. Define the conditional logic for branching
def should_reflect(state: AgentState) -> str:
    """
    Determines whether to trigger the reflection loop or continue the learning session.
    """
    if state["session_ended"]:
        return "reflect"
    else:
        return "continue_session"

# 4. Build the graph
workflow = StateGraph(AgentState)

# Add nodes
workflow.add_node("ExerciseGenerator", generate_exercises)
workflow.add_node("ResponseGrader", grade_responses)
workflow.add_node("MisconceptionDetector", detect_misconceptions)
workflow.add_node("StudentModelUpdater", update_model)
workflow.add_node("RecommendationEngine", recommend_next)
workflow.add_node("SessionBoundary", detect_session_end)
workflow.add_node("ReflectionAgent", reflect_and_optimize)
workflow.add_node("DiversityController", ensure_content_diversity)

# Set the entry point
workflow.set_entry_point("ExerciseGenerator")

# Add edges
workflow.add_edge("ExerciseGenerator", "ResponseGrader")
workflow.add_edge("ResponseGrader", "MisconceptionDetector")
workflow.add_edge("MisconceptionDetector", "StudentModelUpdater")
workflow.add_edge("StudentModelUpdater", "RecommendationEngine")
workflow.add_edge("RecommendationEngine", "SessionBoundary")

# Add the conditional edge for the main loop
workflow.add_conditional_edges(
    "SessionBoundary",
    should_reflect,
    {
        "reflect": "ReflectionAgent",
        "continue_session": "ExerciseGenerator",
    },
)

# Add the reflection loop edges
workflow.add_edge("ReflectionAgent", "DiversityController")
# After the diversity controller, end the graph for this simulation
workflow.add_edge("DiversityController", END)

# Compile the graph
app = workflow.compile()

# 5. Run the simulation
if __name__ == "__main__":
    # Initial state for a new student session
    initial_state = {
        "student_profile": {
            "id": "student123",
            "skill_levels": {"algebra": 0.7, "arithmetic": 0.6},
            "learning_history": [],
        },
        "current_learning_objectives": ["algebra"],
        "agent_configs": {
            "exercise_generator": {"difficulty_range": ["medium", "hard"]},
            "session_boundary": {"max_exercises": 3},
        },
        "session_metrics": {"exercise_count": 0, "total_score": 0},
        # The rest are initialized empty
        "new_exercise": {},
        "student_response": "",
        "grading_results": {},
        "misconceptions": [],
        "recommendations": [],
        "session_ended": False,
    }

    print("---STARTING LEARNING SIMULATION---")
    # The `stream` method allows us to see the output of each step
    for output in app.stream(initial_state):
        # The key is the name of the node that just ran
        node_name = list(output.keys())[0]
        print(f"Output from node '{node_name}':")
        print("==================================")

    print("\n---SIMULATION COMPLETE---")
