const db = require("../config/db")
const sequelize = db.sequelize

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

const findAllTable = async (pointId) => {
  const sql = `show tables like '%_${pointId}_%'`
  const res = await sequelize.query(sql, { type: sequelize.QueryTypes.SELECT })
  return res.map((item) => item[`Tables_in_webfunny_db_event (%_${pointId}_%)`])
}

const createOwnRoutes = (router) => {
  router.post("/heatmapClickPoint", async (ctx, next) => {
    const { body } = ctx.request
    const { pointId } = body
    const res = await findAllTable(pointId)

    let rawRes = res.sort((a, b) => a.slice(-8) - b.slice(-8))
    let [min, max] = [
      rawRes[0].split(/_\d*_/)[1],
      rawRes[rawRes.length - 1].split(/_\d*_/)[1],
    ]

    const tables = rawRes.map((item) => `select * from ${item}`)
    const unions = tables.join("\n UNION ALL \n")

    const sql = `select dom, clickx, clicky from (${unions}) as value`
    const tempRes = await sequelize.query(sql, {
      type: sequelize.QueryTypes.SELECT,
    })

    const finalRes = dataPointHandler(tempRes)
    ctx.body = {
      data: finalRes,
      max,
      min,
      sql,
      total: tempRes.length,
    }
  })
}

module.exports = {
  createOwnRoutes,
}
