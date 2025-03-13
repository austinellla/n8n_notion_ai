const OpenAI = require('openai');

/**
 * Client for interacting with OpenAI API
 */
class OpenAIClient {
  /**
   * Create a new OpenAI client
   * @param {string} apiKey - OpenAI API key
   */
  constructor(apiKey) {
    if (!apiKey) {
      throw new Error('OpenAI API key is required');
    }
    this.client = new OpenAI({ apiKey });
  }

  /**
   * Enhance content using AI
   * @param {Array} items - Array of items from Notion
   * @returns {Promise<Array>} - Array of enhanced items
   */
  async enhanceContent(items) {
    try {
      // Process each item with AI
      const enhancedItems = await Promise.all(items.map(async (item) => {
        // Extract text content from the item
        const textContent = this.extractTextContent(item);
        
        if (!textContent) {
          return item; // Skip if no text content
        }
        
        // Generate AI enhancements
        const enhancement = await this.generateEnhancement(textContent);
        
        // Apply enhancements to the item
        return this.applyEnhancement(item, enhancement);
      }));
      
      return enhancedItems;
    } catch (error) {
      console.error('Error enhancing content with AI:', error);
      throw error;
    }
  }

  /**
   * Extract text content from a Notion item
   * @param {Object} item - Notion item
   * @returns {string} - Extracted text
   */
  extractTextContent(item) {
    // Implementation depends on the structure of your Notion items
    // This is a simplified example
    try {
      const properties = item.properties;
      let textContent = '';
      
      // Extract text from title if it exists
      if (properties.Name && properties.Name.title) {
        textContent += properties.Name.title.map(t => t.plain_text).join('') + '\n';
      }
      
      // Extract text from rich text properties
      Object.keys(properties).forEach(key => {
        if (properties[key].rich_text) {
          textContent += properties[key].rich_text.map(t => t.plain_text).join('') + '\n';
        }
      });
      
      return textContent.trim();
    } catch (error) {
      console.error('Error extracting text content:', error);
      return '';
    }
  }

  /**
   * Generate AI enhancement for text content
   * @param {string} textContent - Text to enhance
   * @returns {Promise<Object>} - AI enhancement
   */
  async generateEnhancement(textContent) {
    try {
      // Call OpenAI API to generate enhancements
      const response = await this.client.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are an AI assistant that enhances content by summarizing, categorizing, and extracting key entities."
          },
          {
            role: "user",
            content: `Please enhance the following content by providing:
            1. A concise summary (max 2 sentences)
            2. 3-5 relevant tags or categories
            3. Key entities mentioned (people, organizations, concepts)
            
            Content: ${textContent}`
          }
        ],
        temperature: 0.7,
      });
      
      const aiResponse = response.choices[0].message.content;
      
      // Parse the AI response into structured data
      // This is a simplified parsing logic
      const summary = aiResponse.match(/summary.*?:(.*?)(?:\n|$)/i)?.[1]?.trim() || '';
      const tagsMatch = aiResponse.match(/tags.*?:(.*?)(?:\n|$)/i)?.[1];
      const tags = tagsMatch ? tagsMatch.split(',').map(tag => tag.trim()) : [];
      const entitiesMatch = aiResponse.match(/entities.*?:(.*?)(?:\n|$)/i)?.[1];
      const entities = entitiesMatch ? entitiesMatch.split(',').map(entity => entity.trim()) : [];
      
      return {
        summary,
        tags,
        entities
      };
    } catch (error) {
      console.error('Error generating AI enhancement:', error);
      return {
        summary: '',
        tags: [],
        entities: []
      };
    }
  }

  /**
   * Apply AI enhancement to a Notion item
   * @param {Object} item - Original Notion item
   * @param {Object} enhancement - AI enhancement
   * @returns {Object} - Enhanced item
   */
  applyEnhancement(item, enhancement) {
    // Create a deep copy of the item
    const enhancedItem = JSON.parse(JSON.stringify(item));
    
    // Apply enhancements to the item properties
    // This is a simplified example - adjust according to your Notion database structure
    try {
      // Add summary if there's a Summary property
      if (enhancement.summary && enhancedItem.properties.Summary) {
        enhancedItem.properties.Summary = {
          rich_text: [
            {
              type: "text",
              text: { content: enhancement.summary }
            }
          ]
        };
      }
      
      // Add tags if there's a Tags property
      if (enhancement.tags.length > 0 && enhancedItem.properties.Tags) {
        enhancedItem.properties.Tags = {
          multi_select: enhancement.tags.map(tag => ({ name: tag }))
        };
      }
      
      // Add entities if there's an Entities property
      if (enhancement.entities.length > 0 && enhancedItem.properties.Entities) {
        enhancedItem.properties.Entities = {
          multi_select: enhancement.entities.map(entity => ({ name: entity }))
        };
      }
      
      return enhancedItem;
    } catch (error) {
      console.error('Error applying enhancement:', error);
      return item; // Return original item if enhancement fails
    }
  }
}

module.exports = { OpenAIClient };