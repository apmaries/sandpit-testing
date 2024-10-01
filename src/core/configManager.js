// ConfigHandler.js
// Description: Centralized configuration module

let applicationConfig = {
  mode: {
    isAdmin: false,
    isTest: window.location.protocol !== "https:",
  },
  datatable: {
    datatable: "",
    parameters: {
      key: {
        key: {
          name: "Conversation ID",
          dataType: "string",
          displayOrder: 0,
          hidden: false,
          format: "string",
        },
      },
      conversation: {
        library_type: {
          name: "Library Type",
          dataType: "string",
          displayOrder: 1,
          hidden: true,
          format: "string",
        },
        division_ids: {
          name: "Division ID",
          dataType: "string",
          displayOrder: 2,
          hidden: true,
          format: "string",
        },
        division_names: {
          name: "Division Name",
          dataType: "string",
          displayOrder: 3,
          hidden: false,
          format: "string",
        },
        start_date: {
          name: "Start Date",
          dataType: "string",
          displayOrder: 4,
          hidden: false,
          format: "datetime",
        },
        end_date: {
          name: "End Date",
          dataType: "string",
          displayOrder: 5,
          hidden: false,
          format: "datetime",
        },
        queue_ids: {
          name: "Queue ID",
          dataType: "string",
          displayOrder: 6,
          hidden: true,
          format: "string",
        },
        queue_names: {
          name: "Queue Name",
          dataType: "string",
          displayOrder: 7,
          hidden: false,
          format: "string",
        },
        media_type: {
          name: "Media Type",
          dataType: "string",
          displayOrder: 8,
          hidden: false,
          format: "string",
        },
      },
      metrics: {
        total_talk_time: {
          name: "Total Talk Time (s)",
          dataType: "integer",
          displayOrder: 9,
          hidden: false,
          format: "seconds",
        },
      },
      evaluation: {
        evluation_total_score: {
          name: "Average Evaluation Score",
          dataType: "integer",
          displayOrder: 10,
          hidden: false,
          format: "percentage",
        },
        evluation_total_critical_score: {
          name: "Average Evaluation Critical Score",
          dataType: "integer",
          displayOrder: 11,
          hidden: false,
          format: "percentage",
        },
      },
      sta: {
        sentiment_score: {
          name: "Sentiment Score",
          dataType: "number",
          displayOrder: 12,
          hidden: false,
          format: "percentage",
        },
        sentiment_trend_class: {
          name: "Sentiment Trend",
          dataType: "string",
          displayOrder: 13,
          hidden: false,
          format: "string",
        },
        empathy_score: {
          name: "Empathy Score",
          dataType: "number",
          displayOrder: 14,
          hidden: false,
          format: "number",
        },
      },
      survey: {
        survey_total_score: {
          name: "Survey Total Score",
          dataType: "integer",
          displayOrder: 15,
          hidden: false,
          format: "percentage",
        },
        survey_promoter_score: {
          name: "Survey Promoter Score",
          dataType: "integer",
          displayOrder: 16,
          hidden: false,
          format: "integer",
        },
      },
      recording: {
        file_state: {
          name: "File State",
          dataType: "string",
          displayOrder: 17,
          hidden: false,
          format: "string",
        },
        archive_date: {
          name: "Archive Date",
          dataType: "string",
          displayOrder: 18,
          hidden: false,
          format: "date",
        },
        delete_date: {
          name: "Delete Date",
          dataType: "string",
          displayOrder: 19,
          hidden: false,
          format: "date",
        },
      },
    },
  },
  integration: "",
  // Add more configuration options as needed
};

export { applicationConfig };
