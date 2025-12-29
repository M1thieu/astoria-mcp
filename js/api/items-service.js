import { getSupabaseClient } from './supabase-client.js';
import { isAdmin } from './auth-service.js';

export async function toggleItemState(itemId, enabled) {
    if (!isAdmin()) {
        return { success: false, error: 'AccÇùs non autorisÇ¸' };
    }

    try {
        const supabase = await getSupabaseClient();

        const { data, error } = await supabase
            .from('items')
            .update({ enabled })
            .eq('id', itemId)
            .select();

        if (error) {
            console.error('Error toggling item:', error);
            return { success: false };
        }

        return { success: true, item: data[0] };
    } catch (error) {
        console.error('Error in toggleItemState:', error);
        return { success: false };
    }
}

export async function getAllItems() {
    try {
        const supabase = await getSupabaseClient();

        const { data, error } = await supabase
            .from('items')
            .select('*')
            .order('name', { ascending: true });

        if (error) {
            console.error('Error fetching items:', error);
            return [];
        }

        return data || [];
    } catch (error) {
        console.error('Error in getAllItems:', error);
        return [];
    }
}
