export async function GET() {
  try {
		const res=await fetch('https://yumemi-frontend-engineer-codecheck-api.vercel.app/api/v1/prefectures', {
			method: 'GET',
			headers: {
				'X-API-KEY': process.env.API_KEY
			}
		})
		const data=await res.json()
    return Response.json(data)
  } catch (error) {
    console.log('Error fetching user data:', error);
    return Response.json({result:[]}, { status: 500 })
  }
}