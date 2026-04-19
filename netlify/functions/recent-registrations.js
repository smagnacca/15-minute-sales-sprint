const { getStore } = require('@netlify/blobs');

const REGISTRATIONS_KEY = 'recent-registrations';
const MAX_RETURN = 20;

exports.handler = async () => {
  try {
    const store = getStore('sprint-data');
    const all = (await store.get(REGISTRATIONS_KEY, { type: 'json' })) || [];
    const recent = all.slice(0, MAX_RETURN).map(r => ({
      firstName: r.firstName,
      city: r.city,
      state: r.state
    }));
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=30, stale-while-revalidate=60',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ count: all.length, registrations: recent })
    };
  } catch (err) {
    console.error('recent-registrations error:', err.message || err);
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ count: 0, registrations: [] })
    };
  }
};
