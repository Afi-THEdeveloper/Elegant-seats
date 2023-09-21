exports.getDashboard = catchAsync(async(req,res) =>{
    const orders = await Order.find().populate('products');
    const totalUsers = await User.find().countDocuments();
    const monthSales = await Order.aggregate([
        {
            $match:{
                status:{$ne:'Cancel'}
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
    ])
    const topSellingProducts = await Order.aggregate([
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
    ])

    const topSellingCategory = await Order.aggregate([
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
              foreignField: 'name',
              as: 'category'
            }
          },
          {
            $sort: {
              totalQuantitySold: -1 
            }
          },
    ])

    const cancelOrders = await Order.aggregate([
        {
            $match: {
              status: 'Cancel' 
            }
          },
          {
            $group: {
              _id: null,
              totalCancelledOrders: { $sum: 1 } 
            }
          },
          {
            $project: {
              _id: 0 
            }
        }
    ])
    
    const paymentStatics = await Order.aggregate([
        {
            $group: {
              _id: '$paymentMethod',
              totalAmount: { $sum: '$totalPrice' }
            }
          }
    ])

    const totalRevenue = await Order.aggregate([
        {
            $group: {
              _id: null,
              totalRevenue: { $sum: '$totalPrice' }
            }
          }
    ])

    const yearlyChart = await Order.aggregate([
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
    ])
    const yearlyData =yearlyChart.map((item)=>{ return item.totalSales});

    const blockedUser = await User.find({blocked:true}).countDocuments();
    
    const today = new Date().toISOString().split('T')[0];
    const todaysRevenue = await Order.aggregate([
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
    ])
    const totalOrders = await Order.aggregate([
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
    ])
    
    const pendingOrders = await Order.aggregate([
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
    ])
    console.log(paymentStatics);
    res.render('./admin/dashboard',{
        monthSales,
        topSellingProducts,
        topSellingCategory,
        cancelOrders,
        paymentStatics,
        totalRevenue,
        todaysRevenue,
        totalOrders,
        yearlyData,
        pendingOrders,
        totalUsers,
        blockedUser,
    });
})