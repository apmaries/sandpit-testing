// ConfigHandler.js
// Description: Centralized configuration module

let applicationConfig = {
  mode: {
    isAdmin: false,
    isTest: window.location.protocol !== "https:",
  },
  datatable: {
    name: "",
    id: "",
    datatableColumns: {
      conversation: {
        key: {
          name: "Conversation ID",
          type: "string",
          displayOrder: 0,
        },
        type: {
          name: "Type",
          type: "string",
          displayOrder: 1,
        },
        division_ids: {
          name: "Division ID",
          type: "string",
          displayOrder: 2,
        },
        division_names: {
          name: "Division Name",
          type: "string",
          displayOrder: 3,
        },
        start_date: {
          name: "Start Date",
          type: "string",
          displayOrder: 4,
        },
        end_date: {
          name: "End Date",
          type: "string",
          displayOrder: 5,
        },
        queue_ids: {
          name: "Queue ID",
          type: "string",
          displayOrder: 6,
        },
        queue_names: {
          name: "Queue Name",
          type: "string",
          displayOrder: 7,
        },
        media_type: {
          name: "Media Type",
          type: "string",
          displayOrder: 8,
        },
      },
      metrics: {
        total_talk_time: {
          name: "Total Talk Time",
          type: "integer",
          displayOrder: 9,
        },
      },
      evaluation: {
        evluation_total_score: {
          name: "Average Evaluation Score",
          type: "integer",
          displayOrder: 10,
        },
        evluation_total_critical_score: {
          name: "Average Evaluation Critical Score",
          type: "integer",
          displayOrder: 11,
        },
      },
      sta: {
        sentiment_score: {
          name: "Sentiment Score",
          type: "number",
          displayOrder: 12,
        },
        sentiment_trend_class: {
          name: "Sentiment Trend",
          type: "string",
          displayOrder: 13,
        },
        min_empathy_score: {
          name: "Min Empathy Score",
          type: "number",
          displayOrder: 14,
        },
        max_empathy_score: {
          name: "Max Empathy Score",
          type: "number",
          displayOrder: 15,
        },
      },
      survey: {
        survey_total_score: {
          name: "Survey Total Score",
          type: "integer",
          displayOrder: 16,
        },
        survey_promoter_score: {
          name: "Survey Promoter Score",
          type: "integer",
          displayOrder: 17,
        },
      },
      recording: {
        file_state: {
          name: "File State",
          type: "string",
          displayOrder: 18,
        },
        archive_date: {
          name: "Archive Date",
          type: "string",
          displayOrder: 19,
        },
        delete_date: {
          name: "Delete Date",
          type: "string",
          displayOrder: 20,
        },
      },
    },
  },
  // Add more configuration options as needed
};

export { applicationConfig };
