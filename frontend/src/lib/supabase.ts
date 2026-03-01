import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY! || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseKey) {
    console.warn('⚠️ Missing Supabase environment variables. Database queries will fail.');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

export async function getProperties() {
    const { data, error } = await supabase.from('properties').select('*');
    if (error) throw error;
    return data;
}

export async function getPropertyByNameOrLocation(query: string) {
    const { data, error } = await supabase
        .from('properties')
        .select('*')
        .or(`name.ilike.%${query}%,location.ilike.%${query}%`)
        .limit(5);

    if (error) throw error;
    return data;
}

export async function getOrCreateUser(telegramId: number) {
    // Try to find the user
    let { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('telegram_id', telegramId)
        .single();

    if (!user && error?.code === 'PGRST116') {
        // User doesn't exist, create them
        const { data: newUser, error: insertError } = await supabase
            .from('users')
            .insert([{ telegram_id: telegramId }])
            .select()
            .single();

        if (insertError) throw insertError;
        user = newUser;
    } else if (error) {
        throw error;
    }

    return user;
}
