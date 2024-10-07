// ConfigHandler.js
// Description: Centralized configuration module

let applicationConfig = {
  mode: {
    isAdmin: false,
    isTest: window.location.protocol !== "https:",
  },
  general: {
    alertDays: 90,
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
      library_metadata: {
        library_type: {
          name: "Library Type",
          dataType: "string",
          displayOrder: 1,
          hidden: true,
          format: "string",
        },
        tags: {
          name: "Tags",
          dataType: "string",
          displayOrder: 2,
          hidden: false,
          format: "string",
        },
      },
      conversation: {
        division_ids: {
          name: "Division ID",
          dataType: "string",
          displayOrder: 3,
          hidden: true,
          format: "string",
        },
        division_names: {
          name: "Division Name",
          dataType: "string",
          displayOrder: 4,
          hidden: false,
          format: "string",
        },
        start_date: {
          name: "Start Date",
          dataType: "string",
          displayOrder: 5,
          hidden: false,
          format: "datetime",
        },
        end_date: {
          name: "End Date",
          dataType: "string",
          displayOrder: 6,
          hidden: false,
          format: "datetime",
        },
        queue_ids: {
          name: "Queue ID",
          dataType: "string",
          displayOrder: 7,
          hidden: true,
          format: "string",
        },
        queue_names: {
          name: "Queue Name",
          dataType: "string",
          displayOrder: 8,
          hidden: false,
          format: "string",
        },
        media_type: {
          name: "Media Type",
          dataType: "string",
          displayOrder: 9,
          hidden: false,
          format: "string",
        },
      },
      metrics: {
        total_talk_time: {
          name: "Total Talk Time (s)",
          dataType: "integer",
          displayOrder: 10,
          hidden: false,
          format: "seconds",
        },
      },
      evaluation: {
        evluation_total_score: {
          name: "Average Evaluation Score",
          dataType: "integer",
          displayOrder: 11,
          hidden: false,
          format: "percentage",
        },
        evluation_total_critical_score: {
          name: "Average Evaluation Critical Score",
          dataType: "integer",
          displayOrder: 12,
          hidden: false,
          format: "percentage",
        },
      },
      sta: {
        sentiment_score: {
          name: "Sentiment Score",
          dataType: "number",
          displayOrder: 13,
          hidden: false,
          format: "percentage",
        },
        sentiment_trend_class: {
          name: "Sentiment Trend",
          dataType: "string",
          displayOrder: 14,
          hidden: false,
          format: "string",
        },
        empathy_score: {
          name: "Empathy Score",
          dataType: "number",
          displayOrder: 15,
          hidden: false,
          format: "number",
        },
      },
      survey: {
        survey_total_score: {
          name: "Survey Total Score",
          dataType: "integer",
          displayOrder: 16,
          hidden: false,
          format: "percentage",
        },
        survey_promoter_score: {
          name: "Survey Promoter Score",
          dataType: "integer",
          displayOrder: 17,
          hidden: false,
          format: "integer",
        },
      },
      recording: {
        file_state: {
          name: "File State",
          dataType: "string",
          displayOrder: 18,
          hidden: false,
          format: "string",
        },
        archive_date: {
          name: "Archive Date",
          dataType: "string",
          displayOrder: 19,
          hidden: false,
          format: "date",
        },
        delete_date: {
          name: "Delete Date",
          dataType: "string",
          displayOrder: 20,
          hidden: false,
          format: "date",
        },
      },
    },
  },
  integration: "",
  svg: {
    info: "M 8 16 C 10.1217 16 12.1566 15.1571 13.6569 13.6569 C 15.1571 12.1566 16 10.1217 16 8 C 16 5.87827 15.1571 3.84344 13.6569 2.34315 C 12.1566 0.842855 10.1217 0 8 0 C 5.87827 0 3.84344 0.842855 2.34315 2.34315 C 0.842855 3.84344 0 5.87827 0 8 C 0 10.1217 0.842855 12.1566 2.34315 13.6569 C 3.84344 15.1571 5.87827 16 8 16 Z M 6.75 10.5 H 7.5 V 8.5 H 6.75 C 6.33437 8.5 6 8.16562 6 7.75 C 6 7.33437 6.33437 7 6.75 7 H 8.25 C 8.66562 7 9 7.33437 9 7.75 V 10.5 H 9.25 C 9.66562 10.5 10 10.8344 10 11.25 C 10 11.6656 9.66562 12 9.25 12 H 6.75 C 6.33437 12 6 11.6656 6 11.25 C 6 10.8344 6.33437 10.5 6.75 10.5 Z M 8 4 C 8.26522 4 8.51957 4.10536 8.70711 4.29289 C 8.89464 4.48043 9 4.73478 9 5 C 9 5.26522 8.89464 5.51957 8.70711 5.70711 C 8.51957 5.89464 8.26522 6 8 6 C 7.73478 6 7.48043 5.89464 7.29289 5.70711 C 7.10536 5.51957 7 5.26522 7 5 C 7 4.73478 7.10536 4.48043 7.29289 4.29289 C 7.48043 4.10536 7.73478 4 8 4 Z",
    warning:
      "M 7.99942 1 C 8.4432 1 8.85261 1.23437 9.07762 1.61875 L 15.8281 13.1187 C 16.0562 13.5062 16.0562 13.9844 15.8344 14.3719 C 15.6125 14.7594 15.1968 15 14.7499 15 H 1.24894 C 0.802029 15 0.386374 14.7594 0.164483 14.3719 C -0.0574075 13.9844 -0.0542823 13.5031 0.170734 13.1187 L 6.92122 1.61875 C 7.14623 1.23437 7.55564 1 7.99942 1 Z M 7.99942 5 C 7.58377 5 7.24937 5.33437 7.24937 5.75 V 9.25 C 7.24937 9.66562 7.58377 10 7.99942 10 C 8.41507 10 8.74947 9.66562 8.74947 9.25 V 5.75 C 8.74947 5.33437 8.41507 5 7.99942 5 Z M 8.99949 12 C 8.99949 11.7348 8.89413 11.4804 8.70658 11.2929 C 8.51903 11.1054 8.26466 11 7.99942 11 C 7.73418 11 7.47981 11.1054 7.29226 11.2929 C 7.10471 11.4804 6.99935 11.7348 6.99935 12 C 6.99935 12.2652 7.10471 12.5196 7.29226 12.7071 C 7.47981 12.8946 7.73418 13 7.99942 13 C 8.26466 13 8.51903 12.8946 8.70658 12.7071 C 8.89413 12.5196 8.99949 12.2652 8.99949 12 Z",
    error:
      "M0.311375 9.1205C-0.103792 8.42641 -0.103792 7.57359 0.311375 6.8795L3.15317 2.1205C3.56834 1.42641 4.33109 1 5.16142 1H10.8418C11.6689 1 12.4349 1.42641 12.85 2.1205L15.6886 6.8795C16.1038 7.57359 16.1038 8.42641 15.6886 9.1205L12.8468 13.8795C12.4317 14.5736 11.6689 15 10.8386 15H5.1582C4.33109 15 3.56512 14.5736 3.14995 13.8795L0.311375 9.1205ZM8 4.01601C7.57196 4.01601 7.2276 4.34904 7.2276 4.76301V8.249C7.2276 8.66296 7.57196 8.996 8 8.996C8.42804 8.996 8.7724 8.66296 8.7724 8.249V4.76301C8.7724 4.34904 8.42804 4.01601 8 4.01601ZM9.02987 10.988C9.02987 10.4371 8.56965 9.992 8 9.992C7.43035 9.992 6.97013 10.4371 6.97013 10.988C6.97013 11.5389 7.43035 11.984 8 11.984C8.56965 11.984 9.02987 11.5389 9.02987 10.988Z",
    success:
      "M8 16C12.4187 16 16 12.4187 16 8C16 3.58125 12.4187 0 8 0C3.58125 0 0 3.58125 0 8C0 12.4187 3.58125 16 8 16ZM11.5312 6.53125L7.53125 10.5312C7.2375 10.825 6.7625 10.825 6.47188 10.5312L4.47188 8.53125C4.17813 8.2375 4.17813 7.7625 4.47188 7.47188C4.76563 7.18125 5.24062 7.17813 5.53125 7.47188L7 8.94063L10.4688 5.46875C10.7625 5.175 11.2375 5.175 11.5281 5.46875C11.8187 5.7625 11.8219 6.2375 11.5281 6.52812L11.5312 6.53125Z",
  },
  tags: [],
  permittedDivisions: [],
  // Add more configuration options as needed
};

export { applicationConfig };
