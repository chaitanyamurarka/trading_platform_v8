// frontend/static/js/app/10-session-manager.js
import { initiateSession, sendHeartbeat } from './api.js';
import { state } from '../utils/state.js';
import { showToast } from '../utils/ui-helpers.js';
import { fetchAndPopulateSymbols } from './api-service.js';

export async function startSession() {
    try {
        const sessionData = await initiateSession();
        state.sessionToken = sessionData.session_token;
        showToast('Session started.', 'info');

        // Fetch symbols and load chart data now that we have a session token.
        await fetchAndPopulateSymbols();

        // Start heartbeat to keep the session alive
        if (state.heartbeatIntervalId) clearInterval(state.heartbeatIntervalId);
        state.heartbeatIntervalId = setInterval(() => {
            if (state.sessionToken) {
                sendHeartbeat(state.sessionToken).catch(e => console.error('Heartbeat failed', e));
            }
        }, 60000); // every minute

    } catch (error) {
        console.error('Failed to initiate session:', error);
        showToast('Could not start a session. Please reload.', 'error');
    }
}