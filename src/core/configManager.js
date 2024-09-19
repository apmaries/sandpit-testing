// ConfigHandler.js
// Description: Centralized configuration module

let applicationConfig = {
  mode: {
    isAdmin: false,
    isTest: window.location.protocol !== "https:",
  },
  datatableColumns: {
    conversation: [
      {
        id: "type",
        name: "Type",
        type: "string",
      },
      {
        id: "division_ids",
        name: "Division ID",
        type: "string",
      },
      {
        id: "division_names",
        name: "Division Name",
        type: "string",
      },
      {
        id: "start_date",
        name: "Start Date",
        type: "string",
      },
      {
        id: "end_date",
        name: "End Date",
        type: "string",
      },
      {
        id: "queue_ids",
        name: "Queue ID",
        type: "string",
      },
      {
        id: "queue_names",
        name: "Queue Name",
        type: "string",
      },
      {
        id: "media_type",
        name: "Media Type",
        type: "string",
      },
    ],
    metrics: [
      {
        id: "total_talk_time",
        name: "Total Talk Time",
        type: "integer",
      },
    ],
    evaluation: [
      {
        id: "evluation_total_score",
        name: "Average Evaluation Score",
        type: "integer",
      },
      {
        id: "evluation_total_critical_score",
        name: "Average Evaluation Critical Score",
        type: "integer",
      },
    ],
    sta: [
      {
        id: "sentiment_score",
        name: "Sentiment Score",
        type: "float",
      },
      {
        id: "sentiment_trend_class",
        name: "Sentiment Trend",
        type: "string",
      },
      {
        id: "min_empathy_score",
        name: "Min Empathy Score",
        type: "float",
      },
      {
        id: "max_empathy_score",
        name: "Max Empathy Score",
        type: "float",
      },
    ],
    survey: [
      {
        id: "survey_total_score",
        name: "Survey Total Score",
        type: "integer",
      },
      {
        id: "survey_promoter_score",
        name: "Survey Promoter Score",
        type: "integer",
      },
    ],
    recording: [
      {
        id: "file_state",
        name: "File State",
        type: "string",
      },
      {
        id: "archive_date",
        name: "Archive Date",
        type: "string",
      },
      {
        id: "delete_date",
        name: "Delete Date",
        type: "string",
      },
    ],
  },
  // Add more configuration options as needed
};

export { applicationConfig };
