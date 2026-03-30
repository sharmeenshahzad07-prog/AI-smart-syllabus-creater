from models import Topic
import heapq

def generate_schedule(topics: list[Topic], available_hours: int) -> list[dict]:
    if not topics:
        return []

    # 1. Use a standard weight based on complexity
    # We'll use a weight of (complexity ^ 1.5) to give slightly more exponential 
    # importance to harder topics, or just a linear weight. Let's stick to 
    # linear plus a base for fairness.
    # Weight = Base (1) + Complexity (1..5)
    
    total_weight = 0
    topic_weights = []
    
    for topic in topics:
        weight = 1.0 + (topic.complexity * 0.5) # Same heuristic as before, but used as weight
        topic_weights.append((topic, weight))
        total_weight += weight
        
    # 2. Scale weights to fit available_hours
    # factor = available_hours / total_weight
    # allocated_time = weight * factor
    
    scaling_factor = available_hours / total_weight if total_weight > 0 else 0
    
    # 3. Build prioritized list using Max Heap
    pq = []
    for topic, weight in topic_weights:
        # Tuple: (-complexity, topic_name, weight)
        heapq.heappush(pq, (-topic.complexity, topic.name, weight))
        
    schedule = []
    current_order = 1
    
    while pq:
        neg_complexity, name, weight = heapq.heappop(pq)
        complexity = -neg_complexity
        
        # Calculate time allocation with scaling and rounding
        allocated_time = round(weight * scaling_factor, 1)
        
        schedule.append({
            "topic": name,
            "complexity": complexity,
            "allocated_time_hours": allocated_time,
            "priority_order": current_order
        })
        current_order += 1
        
    return schedule
