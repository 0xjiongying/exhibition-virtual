// Passport + badge claims — demo mode local, on-chain when configured.

import { getVisitState, isEligible } from './visit.js';
import { getWalletState, sendContractCall, encodeClaim } from './wallet.js';

const CLAIMS_PREFIX = 'hbh.claims.';

function claimsKey(address) {
  const sub = address || 'anonymous';
  return CLAIMS_PREFIX + sub;
}

export function getClaims(address) {
  try {
    return JSON.parse(localStorage.getItem(claimsKey(address)) || '{}');
  } catch {
    return {};
  }
}

function saveClaim(address, badgeKey, record) {
  const all = getClaims(address);
  all[badgeKey] = record;
  localStorage.setItem(claimsKey(address), JSON.stringify(all));
}

export function getPassportView(badgesCatalog, address) {
  const wallet = getWalletState();
  const addr = address ?? wallet.address;
  const visit = getVisitState(addr);
  const claims = getClaims(addr);
  const badges = (badgesCatalog || []).map((b) => {
    const claim = claims[b.key];
    const eligible = isEligible(b, visit, wallet.connected);
    return {
      ...b,
      eligible,
      claimed: !!claim,
      claimMode: claim?.mode || null,
      claimedAt: claim?.at || null,
    };
  });
  return {
    address: addr,
    truncated: wallet.truncated,
    connected: wallet.connected,
    visit,
    badges,
    earned: badges.filter((b) => b.claimed).length,
    available: badges.filter((b) => b.eligible && !b.claimed).length,
  };
}

export async function claimBadge(badge, exhibition) {
  const wallet = getWalletState();
  const visit = getVisitState(wallet.address);
  if (!isEligible(badge, visit, wallet.connected)) {
    return { ok: false, error: 'Not eligible yet. Keep exploring the hall.' };
  }
  const existing = getClaims(wallet.address)[badge.key];
  if (existing) return { ok: false, error: 'Already claimed.' };

  const contractAddr = exhibition?.contracts?.VisitorBadges || '';
  if (wallet.connected && contractAddr && window.ethereum) {
    const data = encodeClaim(badge.id);
    const result = await sendContractCall({
      to: contractAddr,
      data,
      from: wallet.address,
    });
    if (result.ok) {
      saveClaim(wallet.address, badge.key, {
        mode: 'on-chain',
        at: new Date().toISOString(),
        txHash: result.txHash,
        badgeId: badge.id,
      });
      return { ok: true, mode: 'on-chain', txHash: result.txHash };
    }
    // fall through to demo if user rejects or stub fails
  }

  saveClaim(wallet.address, badge.key, {
    mode: 'demo',
    at: new Date().toISOString(),
    badgeId: badge.id,
  });
  return {
    ok: true,
    mode: 'demo',
    message: 'Claimed in demo mode (stored locally). Deploy VisitorBadges and set the address in exhibition.json for on-chain claims.',
  };
}
