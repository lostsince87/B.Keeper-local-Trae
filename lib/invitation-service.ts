import { supabase } from './supabase'

export interface InvitationCode {
  id: string
  code: string
  apiary_id: string
  created_by: string
  expires_at?: string
  max_uses: number
  current_uses: number
  is_active: boolean
  created_at: string
}

export interface Apiary {
  id: string
  name: string
  description?: string
  owner_id: string
  created_at: string
}

// Generera en unik 8-siffrig inbjudningskod
function generateInvitationCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// Skapa en ny inbjudningskod
export async function createInvitationCode(
  apiaryId: string,
  maxUses: number = 1,
  expiresInDays?: number
): Promise<{ data: InvitationCode | null; error: any }> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { data: null, error: 'Användare inte inloggad' }
    }

    let code = generateInvitationCode()
    
    // Kontrollera att koden är unik
    let isUnique = false
    let attempts = 0
    while (!isUnique && attempts < 10) {
      const { data: existing } = await supabase
        .from('invitation_codes')
        .select('id')
        .eq('code', code)
        .single()
      
      if (!existing) {
        isUnique = true
      } else {
        code = generateInvitationCode()
        attempts++
      }
    }

    if (!isUnique) {
      return { data: null, error: 'Kunde inte generera unik kod' }
    }

    const expiresAt = expiresInDays 
      ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000).toISOString()
      : null

    const { data, error } = await supabase
      .from('invitation_codes')
      .insert({
        code,
        apiary_id: apiaryId,
        created_by: user.id,
        expires_at: expiresAt,
        max_uses: maxUses,
        current_uses: 0,
        is_active: true
      })
      .select()
      .single()

    return { data, error }
  } catch (error) {
    return { data: null, error }
  }
}

// Använd en inbjudningskod för att gå med i en bigård
export async function useInvitationCode(code: string): Promise<{ 
  data: { apiary: Apiary; success: boolean } | null; 
  error: any 
}> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { data: null, error: 'Användare inte inloggad' }
    }

    // Hämta inbjudningskoden
    const { data: invitation, error: inviteError } = await supabase
      .from('invitation_codes')
      .select(`
        *,
        apiaries (
          id,
          name,
          description,
          owner_id,
          created_at
        )
      `)
      .eq('code', code.toUpperCase())
      .eq('is_active', true)
      .single()

    if (inviteError || !invitation) {
      return { data: null, error: 'Ogiltig inbjudningskod' }
    }

    // Kontrollera om koden har gått ut
    if (invitation.expires_at && new Date(invitation.expires_at) < new Date()) {
      return { data: null, error: 'Inbjudningskoden har gått ut' }
    }

    // Kontrollera om koden har nått max användningar
    if (invitation.current_uses >= invitation.max_uses) {
      return { data: null, error: 'Inbjudningskoden har redan använts maximalt antal gånger' }
    }

    // Kontrollera om användaren redan är medlem
    const { data: existingMember } = await supabase
      .from('apiary_members')
      .select('id')
      .eq('apiary_id', invitation.apiary_id)
      .eq('user_id', user.id)
      .single()

    if (existingMember) {
      return { data: null, error: 'Du är redan medlem i denna bigård' }
    }

    // Lägg till användaren som medlem
    const { error: memberError } = await supabase
      .from('apiary_members')
      .insert({
        apiary_id: invitation.apiary_id,
        user_id: user.id,
        role: 'member'
      })

    if (memberError) {
      return { data: null, error: 'Kunde inte lägga till dig som medlem' }
    }

    // Uppdatera användningsräknaren
    const { error: updateError } = await supabase
      .from('invitation_codes')
      .update({ current_uses: invitation.current_uses + 1 })
      .eq('id', invitation.id)

    if (updateError) {
      console.warn('Kunde inte uppdatera användningsräknare:', updateError)
    }

    return { 
      data: { 
        apiary: invitation.apiaries,
        success: true 
      }, 
      error: null 
    }
  } catch (error) {
    return { data: null, error }
  }
}

// Hämta alla aktiva inbjudningskoder för en bigård
export async function getInvitationCodes(apiaryId: string): Promise<{
  data: InvitationCode[] | null;
  error: any;
}> {
  try {
    const { data, error } = await supabase
      .from('invitation_codes')
      .select('*')
      .eq('apiary_id', apiaryId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    return { data, error }
  } catch (error) {
    return { data: null, error }
  }
}

// Inaktivera en inbjudningskod
export async function deactivateInvitationCode(codeId: string): Promise<{
  data: boolean;
  error: any;
}> {
  try {
    const { error } = await supabase
      .from('invitation_codes')
      .update({ is_active: false })
      .eq('id', codeId)

    return { data: !error, error }
  } catch (error) {
    return { data: false, error }
  }
}