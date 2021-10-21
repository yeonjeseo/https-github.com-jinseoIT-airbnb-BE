import Room from "../models/Room.js";
import Review from "../models/Review.js";
import Reseravation from "../models/Reservation.js";

export const getRoomsFlexible = async (req, res) => {
  const {
    check_in,
    check_out,
    guests,
    category,
    english,
    korean,
    deutch,
    pet,
    smoking,
    page,
  } = req.query;
  /*
    필요 기능 
    - 페이지네이션
    - 쿼리 여러개 처리 - ok
  */
  const pageCnt = Number(page);
  const limit = 5;
  const offset = (pageCnt - 1) * limit;

  // reduce???
  let findQuery = "";
  if (category) findQuery += `this.category == '${category}' `;
  if (guests) findQuery += `&& this.people > ${guests} `;
  if (english == "true") findQuery += `&& this.english == ${true} `;
  if (korean == "true") findQuery += `&& this.korean == ${true} `;
  if (deutch == "true") findQuery += `&& this.deutch == ${true} `;
  if (pet == "true") findQuery += `&& this.pet == ${true} `;
  if (smoking == "true") findQuery += `&& this.smoking == ${true} `;

  let queryArray = findQuery.split(" ");
  if (queryArray[0] == "&&") {
    queryArray.shift();
    findQuery = queryArray.join(" ");
  }

  let notAvailList;
  if (check_in && check_out) {
    //체크인 체크아웃이 있으면 예약불가능한 방을 조회
    const roomsNotAvailable = await Reseravation.find({
      $and: [{ start: { $lt: check_out } }, { end: { $gt: check_in } }],
    });
    //roomId만 추출
    notAvailList = roomsNotAvailable.map((room) => room.roomId);
  }
  const rooms = await Room.find({
    $and: [{ $where: findQuery }, { _id: { $nin: notAvailList } }],
  })
    .limit(limit)
    .skip(offset);
  return res.status(200).send({ result: "success", rooms });
};

// CREATE Room : Dummy data
export const postRooms = async (req, res) => {
  const {
    title,
    host,
    description,
    category,
    price,
    people,
    rating,
    imageUrl,
    location,
    english,
    korean,
    deutch,
    pet,
    smoking,
    locationName,
    distance,
    available,
  } = req.body;

  const newRoom = {
    title,
    host,
    description,
    category,
    price,
    people,
    rating,
    imageUrl,
    location,
    english,
    korean,
    deutch,
    pet,
    smoking,
    locationName,
    distance,
    available,
  };

  await Room.create(newRoom);

  return res.status(200).send(newRoom);
};

// 방 1개와 그 댓글들 조회
export const getOneRoom = async (req, res) => {
  const { roomId } = req.params;
  const room = await Room.findById(roomId);
  const reviews = await Review.find({ homeId: roomId });

  return res.status(200).send({ result: ":roomId로 받을 때", room, reviews });
};
