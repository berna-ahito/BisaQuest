import { supabase } from '../config/supabaseClient.js';

export const lobbyService = {

    /**
     * Get all environment progress for a player
     * Reads from progress_data JSONB column in players table
     */
    async getEnvironmentProgress(playerId) {
        const [{ data: player, error: playerErr }, { data: envRows, error: envErr }] = await Promise.all([
            supabase.from('players').select('player_id, nickname').eq('player_id', playerId).single(),
            supabase.from('player_environment_progress').select('*').eq('player_id', playerId)
        ]);

        if (playerErr) throw playerErr;
        if (!player) throw new Error('Player not found');
        if (envErr) throw envErr;

        const village = envRows?.find(r => r.environment_name === 'village');
        const forest = envRows?.find(r => r.environment_name === 'forest');
        const castle = envRows?.find(r => r.environment_name === 'castle');

        return {
            player_id: player.player_id,
            nickname: player.nickname,
            environments: {
                village: {
                    progress: village?.completion_percentage || 0,
                    completed: village?.is_completed || false,
                },
                forest: {
                    progress: forest?.completion_percentage || 0,
                    completed: forest?.is_completed || false,
                    locked: !forest?.is_unlocked,
                },
                castle: {
                    progress: castle?.completion_percentage || 0,
                    completed: castle?.is_completed || false,
                    locked: !castle?.is_unlocked,
                },
            },
        };
    },
};