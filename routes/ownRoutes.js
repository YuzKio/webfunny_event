const db = require("../config/db")
const sequelize = db.sequelize
const Dayjs = require("dayjs")

const dataPointHandler = (data) => {
  const res = {}
  // 按照dom分组，且记录每个点的点击次数
  data.forEach((item) => {
    const { dom, clickx, clicky } = item
    const pointIndex = `${clickx}_${clicky}`

    if (res[dom]) {
      // 若已经存在该dom，则直接在该dom下添加该点
      if (res[dom][pointIndex]) {
        res[dom][pointIndex].max++
      } else {
        res[dom][pointIndex] = { clickx, clicky, max: 1 }
      }
    } else {
      // 若不存在dom，则创建分组对象
      res[dom] = { [pointIndex]: { clickx, clicky, max: 1 } }
    }
  })
  return res
}

const findAllTable = async (pointId, startTime, endTime) => {
  let sql = `select table_name from information_schema.tables where table_schema='webfunny_db_event' and table_name like '%_${pointId}_%'`
  if (startTime && endTime) {
    const min = Dayjs(startTime).format("YYYYMMDD")
    const max = Dayjs(endTime).format("YYYYMMDD")
    if (startTime === endTime) {
      sql += ` and table_name like '%_${min}'`
    } else {
      sql += ` and right(table_name,8) between '${min}' and '${max}'`
    }
  }
  const res = await sequelize.query(sql, { type: sequelize.QueryTypes.SELECT })
  return res.map((item) => item["TABLE_NAME"])
}

const createOwnRoutes = (router) => {
  router.post("/heatmapClickPoint", async (ctx, next) => {
    const { body } = ctx.request
    const { pointId, startTime, endTime, route } = body
    const res = await findAllTable(pointId, startTime, endTime)

    let rawRes = res.sort((a, b) => a.slice(-8) - b.slice(-8))

    const tables = rawRes.map((item) => `select * from ${item}`)
    const unions = tables.join("\n UNION ALL \n")

    const sql = `select dom, clickx, clicky from (${unions}) as value where route = '${route}'`
    const tempRes = await sequelize.query(sql, {
      type: sequelize.QueryTypes.SELECT,
    })

    const finalRes = dataPointHandler(tempRes)
    ctx.body = {
      data: finalRes,
      sql,
      total: tempRes.length,
    }
  })
}

module.exports = {
  createOwnRoutes,
}
