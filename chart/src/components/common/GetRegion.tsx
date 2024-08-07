const getEngRegion: { [key: string]: string } = {
  전국: "Whole country",
  서울: "Seoul",
  대전: "Daejeon",
  대구: "Daegu",
  부산: "Busan",
  광주: "Gwangju",
  울산: "Ulsan",
  인천: "Incheon",
  세종: "Sejong",
  경기도: "Gyeonggi-do",
  충청북도: "Chungcheongbuk-do",
  충청남도: "Chungcheongnam-do",
  경상북도: "Gyeongsangbuk-do",
  경상남도: "Gyeongsangnam-do",
  전라북도: "Jeollabuk-do",
  전라남도: "Jeollanam-do",
  강원도: "Gangwon-do",
  제주도: "Jeju",
};

const GetRegion = (regions: string[]): string[] => {
  return regions.map((region) => getEngRegion[region] || region);
};

export default GetRegion;
