// ConfigHandler.js
// Description: Centralized configuration module

let applicationConfig = {
  mode: {
    isAdmin: false,
    isTest: window.location.protocol !== "https:",
  },
  datatable: {
    datatable: "",
    datatableColumns: {
      key: {
        key: {
          name: "Conversation ID",
          type: "string",
          displayOrder: 0,
          hidden: false,
        },
      },
      conversation: {
        type: {
          name: "Type",
          type: "string",
          displayOrder: 1,
          hidden: true,
        },
        division_ids: {
          name: "Division ID",
          type: "string",
          displayOrder: 2,
          hidden: true,
        },
        division_names: {
          name: "Division Name",
          type: "string",
          displayOrder: 3,
          hidden: false,
        },
        start_date: {
          name: "Start Date",
          type: "string",
          displayOrder: 4,
          hidden: false,
        },
        end_date: {
          name: "End Date",
          type: "string",
          displayOrder: 5,
          hidden: false,
        },
        queue_ids: {
          name: "Queue ID",
          type: "string",
          displayOrder: 6,
          hidden: true,
        },
        queue_names: {
          name: "Queue Name",
          type: "string",
          displayOrder: 7,
          hidden: false,
        },
        media_type: {
          name: "Media Type",
          type: "string",
          displayOrder: 8,
          hidden: false,
        },
      },
      metrics: {
        total_talk_time: {
          name: "Total Talk Time",
          type: "integer",
          displayOrder: 9,
          hidden: false,
        },
      },
      evaluation: {
        evluation_total_score: {
          name: "Average Evaluation Score",
          type: "integer",
          displayOrder: 10,
          hidden: false,
        },
        evluation_total_critical_score: {
          name: "Average Evaluation Critical Score",
          type: "integer",
          displayOrder: 11,
          hidden: false,
        },
      },
      sta: {
        sentiment_score: {
          name: "Sentiment Score",
          type: "number",
          displayOrder: 12,
          hidden: false,
        },
        sentiment_trend_class: {
          name: "Sentiment Trend",
          type: "string",
          displayOrder: 13,
          hidden: false,
        },
        empathy_score: {
          name: "Empathy Score",
          type: "number",
          displayOrder: 14,
          hidden: false,
        },
      },
      survey: {
        survey_total_score: {
          name: "Survey Total Score",
          type: "integer",
          displayOrder: 15,
          hidden: false,
        },
        survey_promoter_score: {
          name: "Survey Promoter Score",
          type: "integer",
          displayOrder: 16,
          hidden: false,
        },
      },
      recording: {
        file_state: {
          name: "File State",
          type: "string",
          displayOrder: 17,
          hidden: false,
        },
        archive_date: {
          name: "Archive Date",
          type: "string",
          displayOrder: 18,
          hidden: false,
        },
        delete_date: {
          name: "Delete Date",
          type: "string",
          displayOrder: 19,
          hidden: false,
        },
      },
    },
  },
  integration: "",
  // Add more configuration options as needed
};

export { applicationConfig };
