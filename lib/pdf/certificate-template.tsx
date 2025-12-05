import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";

// 스타일 정의
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: "Helvetica",
  },
  header: {
    fontSize: 24,
    textAlign: "center",
    marginBottom: 20,
    fontWeight: "bold",
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 10,
    backgroundColor: "#f3f4f6",
    padding: 8,
  },
  row: {
    flexDirection: "row",
    marginBottom: 5,
  },
  label: {
    width: "30%",
    fontWeight: "bold",
  },
  value: {
    width: "70%",
  },
  table: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#000",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#e5e7eb",
    borderBottomWidth: 1,
    borderBottomColor: "#000",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#d1d5db",
  },
  tableCell: {
    padding: 5,
    borderRightWidth: 1,
    borderRightColor: "#d1d5db",
    fontSize: 9,
  },
  tableCellNo: {
    width: "8%",
  },
  tableCellName: {
    width: "25%",
  },
  tableCellNationality: {
    width: "15%",
  },
  tableCellTime: {
    width: "27%",
  },
  tableCellImages: {
    width: "25%",
  },
  imageContainer: {
    flexDirection: "row",
    gap: 5,
  },
  thumbnail: {
    width: 40,
    height: 30,
    objectFit: "contain",
  },
  screenshot: {
    width: 200,
    height: 112,
    marginBottom: 10,
  },
  qrCode: {
    width: 100,
    height: 100,
    alignSelf: "center",
    marginTop: 20,
  },
  footer: {
    marginTop: 30,
    textAlign: "center",
    fontSize: 8,
    color: "#6b7280",
  },
});

interface Attendee {
  id: string;
  name: string;
  nationality: string;
  signatureUrl: string;
  selfieUrl: string;
  completedAt: string;
}

interface CertificateProps {
  companyName: string;
  siteName?: string;
  educationTitle: string;
  educationDate: string;
  totalDuration: number;
  attendees: Attendee[];
  screenshots: string[];
  qrCode?: string;
}

export function CertificateTemplate(props: CertificateProps) {
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}시간 ${minutes}분`;
    }
    return `${minutes}분 ${secs}초`;
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* 헤더 */}
        <Text style={styles.header}>안전교육 이수 확인서</Text>
        <Text style={{ textAlign: "center", fontSize: 12, marginBottom: 30 }}>
          Safety Education Completion Certificate
        </Text>

        {/* 기본 정보 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>교육 정보</Text>
          <View style={styles.row}>
            <Text style={styles.label}>회사명:</Text>
            <Text style={styles.value}>{props.companyName}</Text>
          </View>
          {props.siteName && (
            <View style={styles.row}>
              <Text style={styles.label}>현장명:</Text>
              <Text style={styles.value}>{props.siteName}</Text>
            </View>
          )}
          <View style={styles.row}>
            <Text style={styles.label}>교육명:</Text>
            <Text style={styles.value}>{props.educationTitle}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>교육일시:</Text>
            <Text style={styles.value}>{props.educationDate}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>총 시간:</Text>
            <Text style={styles.value}>{formatDuration(props.totalDuration)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>참석 인원:</Text>
            <Text style={styles.value}>{props.attendees.length}명</Text>
          </View>
        </View>

        {/* 교육 내용 스크린샷 */}
        {props.screenshots.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>교육 내용</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
              {props.screenshots.slice(0, 4).map((url, idx) => (
                <Image key={idx} src={url} style={styles.screenshot} />
              ))}
            </View>
          </View>
        )}

        {/* 참석자 서명 리스트 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>참석자 서명 리스트</Text>

          <View style={styles.table}>
            {/* 테이블 헤더 */}
            <View style={styles.tableHeader}>
              <Text style={[styles.tableCell, styles.tableCellNo]}>No</Text>
              <Text style={[styles.tableCell, styles.tableCellName]}>이름</Text>
              <Text style={[styles.tableCell, styles.tableCellNationality]}>
                국적
              </Text>
              <Text style={[styles.tableCell, styles.tableCellTime]}>
                완료 시간
              </Text>
              <Text style={[styles.tableCell, styles.tableCellImages]}>
                서명/셀카
              </Text>
            </View>

            {/* 테이블 행 */}
            {props.attendees.map((attendee, idx) => (
              <View key={attendee.id} style={styles.tableRow}>
                <Text style={[styles.tableCell, styles.tableCellNo]}>
                  {idx + 1}
                </Text>
                <Text style={[styles.tableCell, styles.tableCellName]}>
                  {attendee.name}
                </Text>
                <Text style={[styles.tableCell, styles.tableCellNationality]}>
                  {attendee.nationality}
                </Text>
                <Text style={[styles.tableCell, styles.tableCellTime]}>
                  {formatDateTime(attendee.completedAt)}
                </Text>
                <View style={[styles.tableCell, styles.tableCellImages]}>
                  <View style={styles.imageContainer}>
                    <Image
                      src={attendee.signatureUrl}
                      style={styles.thumbnail}
                    />
                    <Image src={attendee.selfieUrl} style={styles.thumbnail} />
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* QR 코드 */}
        {props.qrCode && (
          <View style={styles.section}>
            <Text style={{ textAlign: "center", marginBottom: 10 }}>
              문서 검증용 QR 코드
            </Text>
            <Image src={props.qrCode} style={styles.qrCode} />
          </View>
        )}

        {/* 푸터 */}
        <View style={styles.footer}>
          <Text>
            이 문서는 안전교육 플랫폼에서 자동으로 생성되었습니다.
          </Text>
          <Text>
            발급일시: {new Date().toLocaleString("ko-KR")}
          </Text>
        </View>
      </Page>
    </Document>
  );
}
