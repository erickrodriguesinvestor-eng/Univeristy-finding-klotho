/* global configuration — loaded first */
const MF_CONFIG = {
  API_URL: window.location.hostname === 'localhost'
    ? 'http://localhost:3000/api'
    : '/api',

  models: {
    mythos: {
      id: 'mythos',
      label: 'Mythos 5',
      endpoint: '/mythos-query',
      maxTokens: 1024,
      color: '#9b72ff',
    },
    fable: {
      id: 'fable',
      label: 'Fable 5',
      endpoint: '/fable-query',
      maxTokens: 1024,
      color: '#3ecf8e',
    },
  },

  storage: {
    scoreKey: 'mf_score',
    historyKey: 'mf_history',
    maxHistory: 50,
  },
};
