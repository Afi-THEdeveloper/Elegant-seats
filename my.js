exports.showDashboard = async (req, res) => {
    try {
      const [orders, totalUsers, monthSales, totalRevenue, todaysRevenue, topSellingCategory, topSellingProducts, pendingOrders, cancelOrders, paymentStatics, blockedUser, totalOrders, yearlyChart] = await Promise.all([
        Order.find().populate('products'),
        User.find().countDocuments(),
        Order.aggregate([
            {
                $match:{
                    status:{$ne:'Cancelled'}
                }
            },
            {
      
                $group: {
                    _id: {
                      year: { $year: '$orderDate' },
                      month: { $month: '$orderDate' }
                    },
                    totalSales: { $sum: '$totalPrice' }
                }
            },
            {
                $sort: {
                  '_id.year': 1,
                  '_id.month': 1
                }
            }
          // ... your aggregation pipeline for monthSales
        ]),
        Order.aggregate([
            {
                $group: {
                  _id: null,
                  totalRevenue: { $sum: '$totalPrice' }
                }
              }
          // ... your aggregation pipeline for totalRevenue
        ]),
        Order.aggregate([
            {
                $match: {
                    orderDate: {
                        $gte: new Date(today), 
                        $lt: new Date(new Date(today).setDate(new Date(today).getDate() + 1)) 
                    }
                }
            },
            {
                $group: {
                    _id: null,
                    todaysSales: { $sum: '$totalPrice' }
                }
            }
          // ... your aggregation pipeline for todaysRevenue
        ]),
        Order.aggregate([
            {
                $unwind: '$products'
              },
              {
                $lookup: {
                  from: 'products', 
                  localField: 'products.product',
                  foreignField: '_id',
                  as: 'productInfo'
                }
              },
              {
                $unwind: '$productInfo'
              },
              {
                $group: {
                  _id: '$productInfo.category',
                  totalQuantitySold: { $sum: '$products.quantity' }
                }
              },
              {
                $lookup: {
                  from: 'categories', 
                  localField: '_id',
                  foreignField: '_id',
                  as: 'category'
                }
              },
              {
                $sort: {
                  totalQuantitySold: -1 
                }
              },
          // ... your aggregation pipeline for topSellingCategory
        ]),
        Order.aggregate([
            {
                $unwind: '$products'
            },
            {
                $group: {
                  _id: '$products.product',
                  totalQuantitySold: { $sum: '$products.quantity' }
                }
            },
            {
                $lookup: {
                  from: 'products', 
                  localField: '_id',
                  foreignField: '_id',
                  as: 'productInfo'
                }
            },
            {
                $unwind: '$productInfo'
            },
            {
                $sort: {
                  totalQuantitySold: -1 
                }
            },
            {
                $limit: 5 
            }
          // ... your aggregation pipeline for topSellingProducts
        ]),
        Order.aggregate([
            {
                $match: {
                  status: 'Pending'
                }
            },
            {
                $lookup: {
                  from: 'products', 
                  localField: 'products.product',
                  foreignField: '_id',
                  as: 'productsInfo'
                }
            }
          // ... your aggregation pipeline for pendingOrders
        ]),
        Order.aggregate([
            {
                $match: {
                  status: 'Cancelled' 
                }
              },
              {
                
                $lookup: {
                  from: 'products', 
                  localField: 'products.product',
                  foreignField: '_id',
                  as: 'productsInfo'
                }
              },
          // ... your aggregation pipeline for cancelOrders
        ]),
        Order.aggregate([
            {
                $group: {
                  _id: '$paymentMethod',
                  totalAmount: { $sum: '$totalPrice' }
                }
            }
          // ... your aggregation pipeline for paymentStatics
        ]),
        User.find({ blocked: true }).countDocuments(),
        Order.aggregate([
            {
                $match: {
                    status: { $ne: 'Cancel' }
                }
            },
            {
                $group: {
                    _id: null,
                    totalOrders: { $sum: 1 }
                }
            }
          // ... your aggregation pipeline for totalOrders
        ]),
        Order.aggregate([
            {
                $match: {
                  status: 'Delivered', 
                }
              },
              {
                $group: {
                  _id: {
                    year: { $year: '$orderDate' },
                    month: { $month: '$orderDate' }
                  },
                  totalSales: { $sum: '$totalPrice' }
                }
              },
              {
                $sort: {
                  '_id.year': 1,
                  '_id.month': 1
                }
              },
              {
          
                $project:{
                    _id:0
                }
              }
          // ... your aggregation pipeline for yearlyChart
        ])
      ]);
  
      const yearlyData = yearlyChart.map((item) => item.totalSales);
  
      return res.render("Admin/dashboard", {
        monthSales,
        totalRevenue,
        todaysRevenue,
        totalUsers,
        topSellingCategory,
        topSellingProducts,
        pendingOrders,
        cancelOrders,
        paymentStatics,
        blockedUser,
        totalOrders,
        yearlyData,
      });
    } catch (error) {
      console.log(error.message);
      res.status(500).send('Internal Server Error');
    }
  };
  