/** @type {import('./$types').PageServerLoad} */
export async function load({fetch}) {
    const res = await fetch("http://backend:8000/leaderboard/")
    const data = await res.json()
	return {
        ...data
	};
}
