const API_KEY = process.env.REACT_APP_SMOOBU_API_KEY;

export async function fetchAppartements() {
  try {
    const response = await fetch("https://login.smoobu.com/api/apartments", {
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) throw new Error("Erreur lors de la récupération des appartements");

    const data = await response.json();
    return data; // Liste des appartements
  } catch (error) {
    console.error("Erreur API Smoobu:", error);
    return [];
  }
}

export async function fetchDisponibilites(apartmentId) {
  try {
    const response = await fetch(
      `https://login.smoobu.com/api/availability?apartmentId=${apartmentId}`,
      {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) throw new Error("Erreur lors de la récupération des disponibilités");

    const data = await response.json();
    return data; // Renvoie les dates disponibles
  } catch (error) {
    console.error("Erreur API Smoobu:", error);
    return [];
  }
}
