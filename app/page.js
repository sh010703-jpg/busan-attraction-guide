"use client";

import { useEffect, useMemo, useState } from "react";
import "./globals.css";

export default function Home() {
  const [spots, setSpots] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [selectedGugun, setSelectedGugun] = useState("전체");
  const [selectedSpot, setSelectedSpot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadAttractions() {
      try {
        setLoading(true);
        const res = await fetch("/api/attractions?pageNo=1&numOfRows=120");
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "데이터를 불러오지 못했습니다.");
        }

        setSpots(data.items || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadAttractions();
  }, []);

  const gugunList = useMemo(() => {
    const list = spots.map((spot) => spot.GUGUN_NM).filter(Boolean);
    return ["전체", ...new Set(list)];
  }, [spots]);

  const filteredSpots = useMemo(() => {
    return spots.filter((spot) => {
      const text = `
        ${spot.MAIN_TITLE || ""}
        ${spot.PLACE || ""}
        ${spot.TITLE || ""}
        ${spot.SUBTITLE || ""}
        ${spot.ADDR1 || ""}
        ${spot.ITEMCNTNTS || ""}
      `.toLowerCase();

      const matchKeyword = text.includes(keyword.toLowerCase());
      const matchGugun =
        selectedGugun === "전체" || spot.GUGUN_NM === selectedGugun;

      return matchKeyword && matchGugun;
    });
  }, [spots, keyword, selectedGugun]);

  return (
    <main>
      <section className="hero">
        <p className="badge">부산광역시 공공데이터 활용</p>
        <h1>부산명소 안내 서비스</h1>
        <p className="heroText">
          부산의 주요 관광명소를 검색하고, 위치·주소·이용정보를 한눈에 확인해보세요.
        </p>
      </section>

      <section className="searchBox">
        <input
          type="text"
          placeholder="명소명, 지역명, 키워드를 검색하세요. 예: 흰여울, 영도, 바다"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />

        <select
          value={selectedGugun}
          onChange={(e) => setSelectedGugun(e.target.value)}
        >
          {gugunList.map((gugun) => (
            <option key={gugun} value={gugun}>
              {gugun}
            </option>
          ))}
        </select>
      </section>

      <section className="resultInfo">
        <p>
          총 <strong>{filteredSpots.length}</strong>개의 명소가 검색되었습니다.
        </p>
      </section>

      {loading && <p className="status">부산명소 데이터를 불러오는 중입니다...</p>}

      {error && <p className="error">오류: {error}</p>}

      {!loading && !error && (
        <section className="grid">
          {filteredSpots.map((spot) => (
            <SpotCard
              key={spot.UC_SEQ}
              spot={spot}
              onSelect={() => setSelectedSpot(spot)}
            />
          ))}
        </section>
      )}

      {selectedSpot && (
        <SpotModal spot={selectedSpot} onClose={() => setSelectedSpot(null)} />
      )}
    </main>
  );
}

function SpotCard({ spot, onSelect }) {
  const imageUrl = getImageUrl(spot.MAIN_IMG_THUMB || spot.MAIN_IMG_NORMAL);
  const mapUrl = getMapUrl(spot);

  return (
    <article className="card">
      <div className="imageWrap">
        {imageUrl ? (
          <img src={imageUrl} alt={spot.MAIN_TITLE || "부산명소 이미지"} />
        ) : (
          <div className="noImage">이미지 없음</div>
        )}
      </div>

      <div className="cardBody">
        <div className="cardHeader">
          <span className="gugun">{spot.GUGUN_NM || "부산"}</span>
          <h2>{spot.MAIN_TITLE || spot.PLACE || "이름 없는 명소"}</h2>
        </div>

        {spot.SUBTITLE && <p className="subtitle">{spot.SUBTITLE}</p>}

        {spot.ADDR1 && (
          <p className="info">
            <strong>주소</strong> {spot.ADDR1}
          </p>
        )}

        {spot.USAGE_AMOUNT && (
          <p className="info">
            <strong>이용요금</strong> {spot.USAGE_AMOUNT}
          </p>
        )}

        {spot.ITEMCNTNTS && (
          <p className="description">{stripHtml(spot.ITEMCNTNTS)}</p>
        )}

        <div className="buttons">
          <button type="button" onClick={onSelect}>
            상세보기
          </button>

          {mapUrl && (
            <a href={mapUrl} target="_blank" rel="noopener noreferrer">
              지도 보기
            </a>
          )}
        </div>
      </div>
    </article>
  );
}

function SpotModal({ spot, onClose }) {
  const imageUrl = getImageUrl(spot.MAIN_IMG_NORMAL || spot.MAIN_IMG_THUMB);
  const mapUrl = getMapUrl(spot);

  return (
    <div className="modalOverlay" onClick={onClose}>
      <section className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="closeButton" type="button" onClick={onClose}>
          닫기
        </button>

        {imageUrl && (
          <div className="modalImage">
            <img src={imageUrl} alt={spot.MAIN_TITLE || "부산명소 이미지"} />
          </div>
        )}

        <div className="modalBody">
          <span className="gugun">{spot.GUGUN_NM || "부산"}</span>
          <h2>{spot.MAIN_TITLE || spot.PLACE || "부산명소"}</h2>

          {spot.TITLE && <p className="modalTitle">{spot.TITLE}</p>}
          {spot.SUBTITLE && <p className="subtitle">{spot.SUBTITLE}</p>}

          <div className="detailList">
            {spot.ADDR1 && (
              <p>
                <strong>주소</strong>
                <span>{spot.ADDR1}</span>
              </p>
            )}

            {spot.CNTCT_TEL && (
              <p>
                <strong>연락처</strong>
                <span>{spot.CNTCT_TEL}</span>
              </p>
            )}

            {spot.USAGE_DAY && (
              <p>
                <strong>운영일</strong>
                <span>{spot.USAGE_DAY}</span>
              </p>
            )}

            {spot.HLDY_INFO && (
              <p>
                <strong>휴무일</strong>
                <span>{spot.HLDY_INFO}</span>
              </p>
            )}

            {spot.USAGE_DAY_WEEK_AND_TIME && (
              <p>
                <strong>운영시간</strong>
                <span>{spot.USAGE_DAY_WEEK_AND_TIME}</span>
              </p>
            )}

            {spot.USAGE_AMOUNT && (
              <p>
                <strong>이용요금</strong>
                <span>{spot.USAGE_AMOUNT}</span>
              </p>
            )}

            {spot.TRFC_INFO && (
              <p>
                <strong>교통정보</strong>
                <span>{spot.TRFC_INFO}</span>
              </p>
            )}
          </div>

          {spot.ITEMCNTNTS && (
            <div className="contentsBox">
              <h3>상세 소개</h3>
              <p>{stripHtml(spot.ITEMCNTNTS)}</p>
            </div>
          )}

          <div className="buttons modalButtons">
            {mapUrl && (
              <a href={mapUrl} target="_blank" rel="noopener noreferrer">
                지도에서 보기
              </a>
            )}

            {spot.HOMEPAGE_URL && (
              <a
                href={spot.HOMEPAGE_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                홈페이지 이동
              </a>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

function getImageUrl(url) {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  return `https://www.visitbusan.net${url}`;
}

function getMapUrl(spot) {
  if (spot.LAT && spot.LNG) {
    return `https://map.kakao.com/link/map/${encodeURIComponent(
      spot.MAIN_TITLE || "부산명소"
    )},${spot.LAT},${spot.LNG}`;
  }

  if (spot.ADDR1) {
    return `https://map.kakao.com/link/search/${encodeURIComponent(spot.ADDR1)}`;
  }

  return "";
}

function stripHtml(text) {
  return text
    .replace(/<[^>]*>?/g, "")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .trim();
}
