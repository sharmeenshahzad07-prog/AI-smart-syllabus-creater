import random

def get_chatbot_response(message: str, schedule: list = None) -> str:
    msg = message.lower().strip()
    
    if not schedule:
        return "I'm ready to help, but I need to see your syllabus first! Upload your PDF/TXT and I'll analyze the workload for you. 😊"

    # Deep Analysis of Schedule
    hardest_topics = [item['topic'] for item in schedule if item['complexity'] >= 4]
    easy_topics = [item['topic'] for item in schedule if item['complexity'] <= 2]
    total_hours = sum(item['allocated_time_hours'] for item in schedule)
    total_minutes = int(total_hours * 60)
    
    # Proactive advice based on total workload
    if total_hours > 20:
        workload_tip = "This is a heavy syllabus! Don't try to cram. Break your study blocks into 45-minute sessions."
    else:
        workload_tip = "Your workload looks manageable. You can focus on deep work sessions of 90 minutes."

    # Specific Keyword Matching
    if any(k in msg for k in ["hardest", "difficult", "tough", "problem"]):
        if hardest_topics:
            return f"The real challenge will be {', '.join(hardest_topics[:2])}. I've prioritized these as they have high complexity scores. Should we break them down further?"
        return "Everything looks quite simple actually! You should breeze through this if you stay consistent."
    
    if any(k in msg for k in ["start", "begin", "first", "order"]):
        first_topic = schedule[0]['topic']
        return f"Start with **{first_topic}**. It's ranked #1 in my priority queue because its complexity requires peak mental energy. Want to know why it's prioritized?"
    
    if any(k in msg for k in ["time", "hours", "long", "duration"]):
        return f"The plan covers approximately {total_hours:.1f} hours ({total_minutes} minutes). {workload_tip}"

    if any(k in msg for k in ["skip", "ignore", "easy", "less time"]):
        if easy_topics:
            return f"If you're short on time, you could spend less effort on {easy_topics[0]}. But be careful, foundational topics often hide in easy labels!"
        return "I wouldn't skip anything here. Every topic seems essential for a complete understanding."

    if any(k in msg for k in ["tip", "advice", "help", "how"]):
        tips = [
            "Use Active Recall: Close your books and write down everything you remember about a topic.",
            "Try the Feynman Technique: Explain the concept as if you're teaching a 10-year-old.",
            "Mind Mapping: Connect the harder topics to easier ones to build a mental web.",
            f"Focus on the {len(hardest_topics)} critical topics I've identified. They are the 'make or break' of this syllabus."
        ]
        return random.choice(tips)

    if any(k in msg for k in ["thanks", "thank", "wow", "good"]):
        return "You're welcome! I'm here to ensure you crush this exam. What's next on your mind? 🚀"

    # Contextual Follow-ups (Handling "Yes" / "Why")
    if any(k in msg for k in ["yes", "ok", "sure", "why", "tell me", "explain"]):
        first_topic = schedule[0]
        return f"Because **{first_topic['topic']}** has a complexity score of {first_topic['complexity']}/5, it requires the most cognitive load. In a 'Greedy' approach, we tackle the hardest tasks first when your brain's ATP levels are highest. This prevents burnout on easy tasks later. Ready to execute this plan?"

    return "I'm your AI Study Assistant. I've analyzed your syllabus and created a priority roadmap. You can ask me 'Where should I start?', 'Which topics are the hardest?', or for 'General study tips'!"
