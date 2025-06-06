// js/db-config.js
const db = new Dexie("SailAnalyzerDB");

// Definieer het schema van je database.
// 'sessionDataStore' zal een object store zijn.
// 'id' is de primaire sleutel. We gebruiken hier een simpele, vaste ID omdat we
// waarschijnlijk maar één tijdelijk object per keer willen opslaan voor de overdracht.
// Als je meerdere sessies permanent client-side wilt opslaan, zou je een auto-incrementing '++id'
// of een andere unieke identifier per sessie gebruiken.
// Voor nu: 'key' is de primaire sleutel, 'data' bevat het object.
db.version(1).stores({
    tempSessionData: '&key, data' // '&key' betekent dat 'key' uniek moet zijn en de primaire sleutel is.
});

console.log("Dexie DB initialized:", db);