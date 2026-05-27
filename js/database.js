/**
 * KlothoLab Database Engine
 * IndexedDB-based user database with full CRUD operations
 */

const KlothoDB = {
  name: 'KlothoLabDB',
  version: 3,
  db: null,

  stores: {
    users: 'users',
    biomarkers: 'biomarkers',
    sessions: 'sessions',
    protocols: 'protocols',
    history: 'history'
  },

  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.name, this.version);

      request.onerror = () => reject(request.error);

      request.onsuccess = (e) => {
        this.db = e.target.result;
        console.log('[KlothoDB] Database initialized v' + this.version);
        resolve(this.db);
      };

      request.onupgradeneeded = (e) => {
        const db = e.target.result;

        // Users store
        if (!db.objectStoreNames.contains('users')) {
          const usersStore = db.createObjectStore('users', { keyPath: 'id' });
          usersStore.createIndex('email', 'email', { unique: true });
          usersStore.createIndex('createdAt', 'createdAt');
        }

        // Biomarkers store
        if (!db.objectStoreNames.contains('biomarkers')) {
          const bmStore = db.createObjectStore('biomarkers', { keyPath: 'id', autoIncrement: true });
          bmStore.createIndex('userId', 'userId');
          bmStore.createIndex('type', 'type');
          bmStore.createIndex('date', 'date');
          bmStore.createIndex('userId_type', ['userId', 'type']);
        }

        // Sessions store (auth)
        if (!db.objectStoreNames.contains('sessions')) {
          const sessionStore = db.createObjectStore('sessions', { keyPath: 'token' });
          sessionStore.createIndex('userId', 'userId');
          sessionStore.createIndex('expiresAt', 'expiresAt');
        }

        // Protocols store
        if (!db.objectStoreNames.contains('protocols')) {
          const protocolStore = db.createObjectStore('protocols', { keyPath: 'id', autoIncrement: true });
          protocolStore.createIndex('userId', 'userId');
        }

        // History store (score history)
        if (!db.objectStoreNames.contains('history')) {
          const histStore = db.createObjectStore('history', { keyPath: 'id', autoIncrement: true });
          histStore.createIndex('userId', 'userId');
          histStore.createIndex('date', 'date');
        }

        console.log('[KlothoDB] Schema created/updated');
      };
    });
  },

  // GENERIC CRUD
  async add(storeName, data) {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const req = store.add(data);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  },

  async put(storeName, data) {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const req = store.put(data);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  },

  async get(storeName, key) {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const req = store.get(key);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  },

  async getByIndex(storeName, indexName, value) {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const index = store.index(indexName);
      const req = index.get(value);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  },

  async getAllByIndex(storeName, indexName, value) {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const index = store.index(indexName);
      const req = index.getAll(value);
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  },

  async getAll(storeName) {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  },

  async delete(storeName, key) {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const req = store.delete(key);
      req.onsuccess = () => resolve(true);
      req.onerror = () => reject(req.error);
    });
  },

  // USER OPERATIONS
  async createUser(userData) {
    const id = 'user_' + Date.now() + '_' + Math.random().toString(36).slice(2, 9);
    const user = {
      id,
      email: userData.email.toLowerCase().trim(),
      passwordHash: KlothoAuth.hashPassword(userData.password),
      name: userData.name,
      birthDate: userData.birthDate,
      gender: userData.gender,
      height: userData.height || null,
      weight: userData.weight || null,
      plan: 'starter',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      profile: {
        avatar: userData.name.charAt(0).toUpperCase(),
        bio: '',
        goals: [],
        conditions: [],
        medications: [],
        lifestyle: {
          sleep: 7,
          exercise: 3,
          stress: 5,
          alcohol: 0,
          smoking: false,
          diet: 'balanced'
        }
      },
      metrics: {
        biologicalAge: null,
        klothoScore: null,
        lastUpdated: null
      }
    };

    await this.add('users', user);

    // Seed demo biomarkers
    await this.seedBiomarkers(id, userData.birthDate);

    // Seed score history
    await this.seedHistory(id, user);

    return user;
  },

  async getUserByEmail(email) {
    return this.getByIndex('users', 'email', email.toLowerCase().trim());
  },

  async getUserById(id) {
    return this.get('users', id);
  },

  async updateUser(userId, updates) {
    const user = await this.getUserById(userId);
    if (!user) throw new Error('User not found');
    const updated = { ...user, ...updates, updatedAt: new Date().toISOString() };
    await this.put('users', updated);
    return updated;
  },

  // SESSION OPERATIONS
  async createSession(userId) {
    const token = 'sess_' + Date.now() + '_' + Math.random().toString(36).slice(2, 16);
    const session = {
      token,
      userId,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    };
    await this.add('sessions', session);
    localStorage.setItem('klotho_session', token);
    return session;
  },

  async getSession(token) {
    if (!token) return null;
    const session = await this.get('sessions', token);
    if (!session) return null;
    if (new Date(session.expiresAt) < new Date()) {
      await this.delete('sessions', token);
      return null;
    }
    return session;
  },

  async destroySession(token) {
    await this.delete('sessions', token);
    localStorage.removeItem('klotho_session');
  },

  // BIOMARKER OPERATIONS
  async getBiomarkers(userId) {
    return this.getAllByIndex('biomarkers', 'userId', userId);
  },

  async addBiomarker(userId, type, value, unit, date) {
    const bm = {
      userId,
      type,
      value: parseFloat(value),
      unit,
      date: date || new Date().toISOString(),
      createdAt: new Date().toISOString()
    };
    return this.add('biomarkers', bm);
  },

  async getBiomarkerHistory(userId, type) {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction('biomarkers', 'readonly');
      const store = tx.objectStore('biomarkers');
      const index = store.index('userId_type');
      const req = index.getAll([userId, type]);
      req.onsuccess = () => {
        const results = (req.result || []).sort((a, b) =>
          new Date(a.date) - new Date(b.date)
        );
        resolve(results);
      };
      req.onerror = () => reject(req.error);
    });
  },

  // HISTORY (Score evolution)
  async getHistory(userId) {
    return this.getAllByIndex('history', 'userId', userId);
  },

  // SEED DATA
  async seedBiomarkers(userId, birthDate) {
    const age = birthDate
      ? Math.floor((Date.now() - new Date(birthDate)) / (365.25 * 24 * 3600 * 1000))
      : 35;

    const templates = [
      // Metabolic
      { type: 'glucose_fasting', value: () => 85 + Math.random() * 20, unit: 'mg/dL' },
      { type: 'hba1c', value: () => 4.8 + Math.random() * 1.2, unit: '%' },
      { type: 'insulin', value: () => 6 + Math.random() * 8, unit: 'μU/mL' },
      { type: 'triglycerides', value: () => 80 + Math.random() * 80, unit: 'mg/dL' },
      { type: 'hdl', value: () => 50 + Math.random() * 30, unit: 'mg/dL' },
      { type: 'ldl', value: () => 90 + Math.random() * 60, unit: 'mg/dL' },
      { type: 'total_cholesterol', value: () => 160 + Math.random() * 60, unit: 'mg/dL' },

      // Inflammatory
      { type: 'crp_hs', value: () => (Math.random() * 3).toFixed(2), unit: 'mg/L' },
      { type: 'il6', value: () => (1 + Math.random() * 4).toFixed(1), unit: 'pg/mL' },
      { type: 'tnf_alpha', value: () => (2 + Math.random() * 6).toFixed(1), unit: 'pg/mL' },
      { type: 'homocysteine', value: () => (7 + Math.random() * 8).toFixed(1), unit: 'μmol/L' },

      // Hormonal
      { type: 'testosterone_total', value: () => (400 + Math.random() * 600).toFixed(0), unit: 'ng/dL' },
      { type: 'dhea_s', value: () => (150 + Math.random() * 250).toFixed(0), unit: 'μg/dL' },
      { type: 'igf1', value: () => (120 + Math.random() * 130).toFixed(0), unit: 'ng/mL' },
      { type: 'cortisol_morning', value: () => (12 + Math.random() * 10).toFixed(1), unit: 'μg/dL' },
      { type: 'thyroid_tsh', value: () => (1 + Math.random() * 3).toFixed(2), unit: 'mU/L' },
      { type: 'vitamin_d', value: () => (25 + Math.random() * 55).toFixed(0), unit: 'ng/mL' },

      // Genetic/Epigenetic
      { type: 'telomere_length', value: () => (6.5 - age * 0.02 + Math.random() * 1.5).toFixed(2), unit: 'kb' },
      { type: 'biological_age_epigenetic', value: () => (age - 5 + Math.random() * 10).toFixed(1), unit: 'years' },
      { type: 'nad_level', value: () => (25 + Math.random() * 35).toFixed(0), unit: 'μM' },
    ];

    // Generate 6 months of data
    const months = 6;
    for (const template of templates) {
      for (let m = 0; m < months; m++) {
        const date = new Date();
        date.setMonth(date.getMonth() - (months - 1 - m));
        const bm = {
          userId,
          type: template.type,
          value: parseFloat(template.value()),
          unit: template.unit,
          date: date.toISOString(),
          createdAt: new Date().toISOString()
        };
        await this.add('biomarkers', bm);
      }
    }
  },

  async seedHistory(userId, user) {
    const age = user.birthDate
      ? Math.floor((Date.now() - new Date(user.birthDate)) / (365.25 * 24 * 3600 * 1000))
      : 35;

    const baseScore = 65 + Math.random() * 20;
    const baseBioAge = age - 3 + Math.random() * 8;

    for (let m = 6; m >= 0; m--) {
      const date = new Date();
      date.setMonth(date.getMonth() - m);
      const variation = (6 - m) * 0.5;
      await this.add('history', {
        userId,
        date: date.toISOString(),
        klothoScore: Math.min(100, parseFloat((baseScore + variation + Math.random() * 3).toFixed(1))),
        biologicalAge: parseFloat((baseBioAge - variation * 0.1 + Math.random() * 0.5).toFixed(1)),
        chronologicalAge: age
      });
    }

    // Update user metrics
    const finalScore = Math.min(100, parseFloat((baseScore + 3).toFixed(1)));
    const finalBioAge = parseFloat((baseBioAge - 0.5).toFixed(1));
    await this.updateUser(userId, {
      metrics: {
        biologicalAge: finalBioAge,
        klothoScore: finalScore,
        lastUpdated: new Date().toISOString()
      }
    });
  }
};

// AUTH HELPER
const KlothoAuth = {
  hashPassword(password) {
    // Simple hash for demo (in production, use bcrypt server-side)
    let hash = 0;
    const salt = 'klotho_lab_salt_2026';
    const str = salt + password;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return 'kh_' + Math.abs(hash).toString(36) + '_' + str.length.toString(36);
  },

  verifyPassword(password, hash) {
    return this.hashPassword(password) === hash;
  },

  async login(email, password) {
    const user = await KlothoDB.getUserByEmail(email);
    if (!user) throw new Error('Usuário não encontrado');
    if (!this.verifyPassword(password, user.passwordHash)) {
      throw new Error('Senha incorreta');
    }
    const session = await KlothoDB.createSession(user.id);
    return { user, session };
  },

  async register(userData) {
    const existing = await KlothoDB.getUserByEmail(userData.email);
    if (existing) throw new Error('Este email já está cadastrado');
    if (userData.password.length < 8) throw new Error('Senha deve ter pelo menos 8 caracteres');
    const user = await KlothoDB.createUser(userData);
    const session = await KlothoDB.createSession(user.id);
    return { user, session };
  },

  async getCurrentUser() {
    const token = localStorage.getItem('klotho_session');
    if (!token) return null;
    const session = await KlothoDB.getSession(token);
    if (!session) return null;
    return KlothoDB.getUserById(session.userId);
  },

  async logout() {
    const token = localStorage.getItem('klotho_session');
    if (token) await KlothoDB.destroySession(token);
  },

  requireAuth(redirectTo = '../pages/login.html') {
    const token = localStorage.getItem('klotho_session');
    if (!token) {
      window.location.href = redirectTo;
      return false;
    }
    return true;
  }
};
