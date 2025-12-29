import { getSupabaseClient } from './supabase-client.js';

export async function getInventoryRows(characterId) {
    const supabase = await getSupabaseClient();
    const { data, error } = await supabase
        .from('character_inventory')
        .select('id, item_key, item_index, qty')
        .eq('character_id', characterId)
        .order('item_index', { ascending: true });

    if (error) throw error;
    return data || [];
}

export async function replaceInventoryRows(characterId, rows) {
    const supabase = await getSupabaseClient();
    const { error: deleteError } = await supabase
        .from('character_inventory')
        .delete()
        .eq('character_id', characterId);

    if (deleteError) throw deleteError;
    if (!rows || rows.length === 0) return [];

    const { data, error } = await supabase
        .from('character_inventory')
        .insert(rows)
        .select('id, item_key, item_index, qty');

    if (error) throw error;
    return data || [];
}

export async function upsertInventoryRows(rows) {
    const supabase = await getSupabaseClient();
    if (!rows || rows.length === 0) return [];

    const { data, error } = await supabase
        .from('character_inventory')
        .upsert(rows, { onConflict: 'character_id,item_key' })
        .select('id, item_key, item_index, qty');

    if (error) throw error;
    return data || [];
}

export async function setInventoryItem(characterId, itemKey, itemIndex, qty) {
    const supabase = await getSupabaseClient();
    const safeQty = Math.floor(Number(qty) || 0);

    if (!characterId || !itemKey) {
        throw new Error('Missing inventory identifiers.');
    }

    if (safeQty <= 0) {
        const { error } = await supabase
            .from('character_inventory')
            .delete()
            .eq('character_id', characterId)
            .eq('item_key', itemKey);
        if (error) throw error;
        return null;
    }

    const payload = {
        character_id: characterId,
        item_key: String(itemKey),
        item_index: Number.isFinite(Number(itemIndex)) ? Number(itemIndex) : null,
        qty: safeQty
    };

    const { data, error } = await supabase
        .from('character_inventory')
        .upsert([payload], { onConflict: 'character_id,item_key' })
        .select('id, item_key, item_index, qty')
        .single();

    if (error) throw error;
    return data;
}
