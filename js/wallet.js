// Lightweight wallet bridge — window.ethereum only. No wagmi/React.

const STORAGE_KEY = 'hbh.wallet.address';

const listeners = new Set();

function notify(state) {
  for (const fn of listeners) fn(state);
}

function truncate(addr) {
  if (!addr || addr.length < 12) return addr || '';
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

export function onWalletChange(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

// Keep app state honest when the user switches accounts or chains in the
// wallet UI — a persisted address must never outlive the provider's truth.
function subscribeProvider() {
  const eth = window.ethereum;
  if (!eth?.on || eth.__hbhSubscribed) return;
  eth.__hbhSubscribed = true;
  eth.on('accountsChanged', (accounts) => {
    const next = (accounts && accounts[0]) || '';
    const stored = localStorage.getItem(STORAGE_KEY) || '';
    if (!stored) return; // never connected in this app — nothing to reconcile
    if (next) localStorage.setItem(STORAGE_KEY, next);
    else localStorage.removeItem(STORAGE_KEY);
    notify(getWalletState());
  });
  eth.on('chainChanged', () => notify(getWalletState()));
}
subscribeProvider();
// some wallets inject after page load
window.addEventListener?.('ethereum#initialized', subscribeProvider, { once: true });

export function getWalletState() {
  const address = localStorage.getItem(STORAGE_KEY) || '';
  return {
    address,
    truncated: truncate(address),
    hasProvider: typeof window !== 'undefined' && !!window.ethereum,
    connected: !!address,
  };
}

export async function connectWallet(chainConfig = {}) {
  if (!window.ethereum) {
    return { ok: false, error: 'No wallet found. Install a browser wallet, or continue in demo mode.' };
  }
  try {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    const address = (accounts && accounts[0]) || '';
    if (!address) return { ok: false, error: 'No account selected.' };
    localStorage.setItem(STORAGE_KEY, address);
    await maybeSwitchChain(chainConfig);
    const state = getWalletState();
    notify(state);
    return { ok: true, ...state };
  } catch (err) {
    return { ok: false, error: err?.message || 'Wallet connection was cancelled.' };
  }
}

export function disconnectWallet() {
  localStorage.removeItem(STORAGE_KEY);
  const state = getWalletState();
  notify(state);
  return state;
}

async function maybeSwitchChain(chainConfig) {
  const chainIdHex = chainConfig.chainIdHex;
  if (!chainIdHex || !window.ethereum) return;
  try {
    const current = await window.ethereum.request({ method: 'eth_chainId' });
    if (current?.toLowerCase() === chainIdHex.toLowerCase()) return;
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: chainIdHex }],
    });
  } catch {
    // Placeholder chain id may not exist yet — soft-fail for Phase 1.
  }
}

/** Minimal eth_call / eth_sendTransaction helpers for configured contracts. */
export async function sendContractCall({ to, data, from }) {
  if (!window.ethereum || !to) {
    return { ok: false, demo: true, error: 'Contract address not configured or no wallet.' };
  }
  try {
    const txHash = await window.ethereum.request({
      method: 'eth_sendTransaction',
      params: [{ from, to, data }],
    });
    return { ok: true, txHash };
  } catch (err) {
    return { ok: false, error: err?.message || 'Transaction failed.' };
  }
}

/** Encode claim(uint256) — selector verified via keccak256("claim(uint256)"). */
export function encodeClaim(badgeId) {
  const sel = '379607f5';
  const id = BigInt(badgeId).toString(16).padStart(64, '0');
  return `0x${sel}${id}`;
}

/** Encode recordVisit(bytes32,bool) — selector verified via keccak256("recordVisit(bytes32,bool)"). */
export function encodeRecordVisit(exhibitionIdBytes32, completed) {
  const sel = '58b112ed';
  // bytes32 is left-aligned: short values pad on the RIGHT (unlike uint256)
  const id = String(exhibitionIdBytes32).replace(/^0x/, '').padEnd(64, '0').slice(0, 64);
  const flag = completed ? '1'.padStart(64, '0') : '0'.padStart(64, '0');
  return `0x${sel}${id}${flag}`;
}
