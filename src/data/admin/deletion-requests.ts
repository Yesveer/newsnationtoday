import type { DeletionRequest } from "@/types/admin";

/** A reporter can never delete a live story outright — they file one of these
 *  and an admin decides. */
export const deletionRequests: DeletionRequest[] = [
  {
    id: "req_1",
    newsId: "art_rajya_4",
    newsTitle: "लखनऊ में नई मेट्रो लाइन का उद्घाटन टला",
    requestedByName: "सलीम अंसारी",
    requestedByRole: "reporter",
    reason: "खबर गलत सोर्स से आई थी, अधिकारी ने खंडन जारी किया है।",
    requestedAt: "2026-09-24T20:31:00.000Z",
    status: "pending",
  },
  {
    id: "req_2",
    newsId: "art_manoranjan_3",
    newsTitle: "फिल्म की रिलीज़ डेट फिर आगे बढ़ी",
    requestedByName: "मीरा कपूर",
    requestedByRole: "reporter",
    reason: "डुप्लीकेट है — यही खबर सुबह पब्लिश हो चुकी है।",
    requestedAt: "2026-09-24T17:12:00.000Z",
    status: "pending",
  },
  {
    id: "req_3",
    newsId: "art_tech_2",
    newsTitle: "नए स्मार्टफोन की कीमत लीक",
    requestedByName: "अमित रस्तोगी",
    requestedByRole: "reporter",
    reason: "कंपनी ने लीगल नोटिस की चेतावनी दी है।",
    requestedAt: "2026-09-23T14:05:00.000Z",
    status: "approved",
    decidedByName: "अनन्या शर्मा",
    decidedAt: "2026-09-23T16:20:00.000Z",
  },
  {
    id: "req_4",
    newsId: "art_khel_5",
    newsTitle: "कोच के इस्तीफे की खबर",
    requestedByName: "रोहित वर्मा",
    requestedByRole: "reporter",
    reason: "बोर्ड ने पुष्टि नहीं की।",
    requestedAt: "2026-09-22T11:40:00.000Z",
    status: "rejected",
    decidedByName: "विक्रम सिंह",
    decidedAt: "2026-09-22T13:00:00.000Z",
  },
];
