export async function GET(request) {
  const { searchParams } = new URL(request.url);

  const pageNo = searchParams.get("pageNo") || "1";
  const numOfRows = searchParams.get("numOfRows") || "20";

  const serviceKey = process.env.DATA_API_KEY;

  if (!serviceKey) {
    return Response.json(
      { error: "DATA_API_KEY가 설정되어 있지 않습니다." },
      { status: 500 }
    );
  }

  const apiUrl =
    `http://apis.data.go.kr/6260000/AttractionService/getAttractionKr` +
    `?ServiceKey=${encodeURIComponent(serviceKey)}` +
    `&pageNo=${pageNo}` +
    `&numOfRows=${numOfRows}` +
    `&resultType=json`;

  try {
    const response = await fetch(apiUrl, {
      cache: "no-store"
    });

    if (!response.ok) {
      return Response.json(
        { error: "공공데이터 API 호출에 실패했습니다." },
        { status: response.status }
      );
    }

    const data = await response.json();
    const result = data?.getAttractionKr;
    const items = result?.item || [];

    return Response.json({
      code: result?.header?.code || "00",
      message: result?.header?.message || "OK",
      totalCount: result?.totalCount || items.length,
      items: Array.isArray(items) ? items : [items]
    });
  } catch (error) {
    return Response.json(
      {
        error: "서버에서 데이터를 불러오는 중 오류가 발생했습니다.",
        detail: error.message
      },
      { status: 500 }
    );
  }
}
