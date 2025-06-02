import { Link } from 'react-router';
import BlogCards from 'src/components/dashboard/BlogCards';
// import DailyActivity from 'src/components/dashboard/DailyActivity';
// import NewCustomers from 'src/components/dashboard/NewCustomers';
// import ProductRevenue from 'src/components/dashboard/ProductRevenue';
import TrainHoursEmployee from 'src/components/dashboard/StatusTrainEmp';
import { TrainingHours } from 'src/components/dashboard/TrainingHoursRadar';
import TrainingHoursDivision from 'src/components/dashboard/TrainingHoursDiv';
import NextTraining from 'src/components/dashboard/NextTraining';
import TotalIncome from 'src/components/dashboard/TotalIncome';

const Dashboard = () => {
  return (
    <div className="grid grid-cols-12 gap-30">
      <div className="lg:col-span-8 col-span-12">
        <TrainingHours />
      </div>
      <div className="lg:col-span-4 col-span-12">
        <div className="grid grid-cols-12 h-full items-stretch">
          <div className="col-span-12 mb-30">
            <TrainingHoursDivision />
            {/* <NewCustomers /> */}
          </div>
          <div className="col-span-12">
            <TotalIncome />
          </div>
        </div>
      </div>
      <div className="lg:col-span-8 col-span-12">
        <TrainHoursEmployee />
      </div>
      <div className="lg:col-span-4 col-span-12">
        <NextTraining />
        {/* <DailyActivity /> */}
      </div>
      <div className="col-span-12">
        <BlogCards />
      </div>
      <div className="flex justify-center align-middle gap-2 flex-wrap col-span-12 text-center">
        <p className="text-base">
          Design and Developed by{' '}
          <Link
            to="#"
            target="_blank"
            className="pl-1 text-primary underline decoration-primary"
          >
            Improvement Project
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Dashboard;
