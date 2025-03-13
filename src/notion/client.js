const { Client } = require('@notionhq/client');

/**
 * Client for interacting with the Notion API
 */
class NotionClient {
  /**
   * Create a new Notion client
   * @param {string} apiKey - Notion API key
   */
  constructor(apiKey) {
    if (!apiKey) {
      throw new Error('Notion API key is required');
    }
    this.client = new Client({ auth: apiKey });
  }

  /**
   * Query a Notion database
   * @param {string} databaseId - ID of the database to query
   * @param {Object} filter - Optional filter for the query
   * @returns {Promise<Array>} - Array of database items
   */
  async queryDatabase(databaseId, filter = {}) {
    try {
      const response = await this.client.databases.query({
        database_id: databaseId,
        filter: filter
      });
      
      return response.results;
    } catch (error) {
      console.error('Error querying Notion database:', error);
      throw error;
    }
  }

  /**
   * Update items in a Notion database
   * @param {string} databaseId - ID of the database
   * @param {Array} items - Array of items with updated properties
   * @returns {Promise<Array>} - Array of updated items
   */
  async updateDatabase(databaseId, items) {
    try {
      const updatePromises = items.map(item => {
        return this.client.pages.update({
          page_id: item.id,
          properties: item.properties
        });
      });
      
      return await Promise.all(updatePromises);
    } catch (error) {
      console.error('Error updating Notion database:', error);
      throw error;
    }
  }

  /**
   * Create a new page in a Notion database
   * @param {string} databaseId - ID of the database
   * @param {Object} properties - Page properties
   * @returns {Promise<Object>} - Created page
   */
  async createPage(databaseId, properties) {
    try {
      return await this.client.pages.create({
        parent: { database_id: databaseId },
        properties: properties
      });
    } catch (error) {
      console.error('Error creating Notion page:', error);
      throw error;
    }
  }
}

module.exports = { NotionClient };