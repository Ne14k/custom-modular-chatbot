class TaskRouter {
  constructor(taskMappings = {}) {
    this.taskMappings = {
      // Default mappings - can be overridden
      'code': ['code', 'programming', 'debug', 'function', 'class', 'algorithm'],
      'writing': ['write', 'story', 'poem', 'creative', 'character', 'plot'],
      'analysis': ['analyze', 'research', 'data', 'statistics', 'report'],
      'general': ['help', 'question', 'explain', 'what', 'how', 'why'],
      ...taskMappings
    };
  }

  async process(message, conversation) {
    const detectedTask = this.detectTask(message);
    
    // Add task metadata to the message
    message = {
      originalMessage: message,
      detectedTask: detectedTask,
      timestamp: new Date()
    };

    return message;
  }

  detectTask(message) {
    const lowerMessage = message.toLowerCase();
    
    for (const [task, keywords] of Object.entries(this.taskMappings)) {
      for (const keyword of keywords) {
        if (lowerMessage.includes(keyword)) {
          return task;
        }
      }
    }
    
    return 'general'; // Default task
  }

  getTaskProvider(task) {
    const providerMappings = {
      'code': 'code-assistant',
      'writing': 'creative-writer',
      'analysis': 'analyst',
      'general': 'default'
    };
    
    return providerMappings[task] || 'default';
  }
}

module.exports = TaskRouter; 