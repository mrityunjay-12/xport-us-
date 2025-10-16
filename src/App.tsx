import { BrowserRouter as Router, Routes, Route } from "react-router";
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import NotFound from "./pages/OtherPage/NotFound";
import UserProfiles from "./pages/UserProfiles";
import Videos from "./pages/UiElements/Videos";
import Images from "./pages/UiElements/Images";
import Alerts from "./pages/UiElements/Alerts";
import Badges from "./pages/UiElements/Badges";
import Avatars from "./pages/UiElements/Avatars";
import Buttons from "./pages/UiElements/Buttons";
import LineChart from "./pages/Charts/LineChart";
import BarChart from "./pages/Charts/BarChart";
import Calendar from "./pages/Calendar";
import BasicTables from "./pages/Tables/BasicTables";
import FormElements from "./pages/Forms/FormElements";
import Blank from "./pages/Blank";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Home from "./pages/Dashboard/Home";
import SearchRates from "./pages/Rates/SearchRates";
import CustomRateRequests from "./pages/Rates/CustomRateRequests";
import Quotes from "./pages/Rates/Quotes";
import QuoteApprovals from "./pages/Rates/QuoteApprovals";
import VendorApprovals from "./pages/Vendor/VendorApprovals";
import VendorOrders from "./pages/Vendor/VendorOrders";
import ShipmentExecution from "./pages/Vendor/ShipmentExecution";

import ShipmentDetailsForQuote from "./pages/Pricing/ShipmentDetailsForQuote";
import PriceUploading from "./pages/Pricing/PriceUploading";
import PriceComparison from "./pages/Pricing/PriceComparison";
import ApiPriceFetching from "./pages/Pricing/ApiPriceFetching";
import PriceSelection from "./pages/Pricing/PriceSelection";
import PricingDashboard from "./pages/Pricing/PricingDashboard";
import CompareFreightRates from "./pages/Rates/CompareFreightRates";
import ManageBookings from "./pages/Rates/ManageBookings";
import BookFclLclShipments from "./pages/Rates/BookFclLclShipments";
import ShipmentTrackingMilestones from "./pages/Operations/ShipmentTrackingMilestones";
import Invoices from "./pages/Billing/Invoices";
import Payments from "./pages/Billing/Payments";
import Disputes from "./pages/Billing/Disputes";
import Subscription from "./pages/Billing/Subscription";
import ManageArticles from "./pages/CmsManagement/ManageArticles";
import Knowledge from "./pages/CmsManagement/Knowledge";
import Notifications from "./pages/Notification/Notifications";
import UserDashboard from "./pages/Dashboard/UserDashboard";
import QuoteAndBook from "./pages/Quote/QuoteAndBook";
import ExportPage from "./pages/Export/ExportPage";
import ImportPage from "./pages/Import/ImportPage";
import FinancePage from "./pages/Finance/FinancePage";
import UserSettingsPage from "./pages/Setting/UserSettingsPage";

export default function App() {
  return (
    <>
      <Router>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<SignIn />} />

          {/* Dashboard Layout */}
          <Route element={<AppLayout />}>
            <Route index path="/dashboard" element={<Home />} />

            {/* Others Page */}
            <Route path="/profile" element={<UserProfiles />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/blank" element={<Blank />} />

            {/* vendors */}
            <Route path="/search" element={<SearchRates />} />
            <Route
              path="/rates/custom-requests"
              element={<CustomRateRequests />}
            />
            <Route path="/quotes" element={<Quotes />} />
            <Route path="/quotes/approvals" element={<QuoteApprovals />} />
            <Route
              path="/vendor/vendors-approvals"
              element={<VendorApprovals />}
            />
            <Route path="/vendor/vendor-orders" element={<VendorOrders />} />
            <Route
              path="/vendor/shipments/execution"
              element={<ShipmentExecution />}
            />
            {/* Pricing Managers */}
            <Route path="/pricing/upload" element={<PriceUploading />} />
            <Route path="/pricing/compare" element={<PriceComparison />} />
            <Route path="/pricing/api" element={<ApiPriceFetching />} />
            <Route path="/pricing/selection" element={<PriceSelection />} />
            <Route path="/pricing/dashboard" element={<PricingDashboard />} />

            {/* <Route
              path="/rates/shipment-details"
              element={<ShipmentDetailsForQuote />}
            /> */}

            {/* Freight rates & quotes */}
            <Route path="/rates/compare" element={<CompareFreightRates />} />
            <Route
              path="/rates/shipment-details"
              element={<ShipmentDetailsForQuote />}
            />
            <Route path="/rates/bookings" element={<ManageBookings />} />
            <Route path="/rates/book" element={<BookFclLclShipments />} />

            {/* shipment tracking  */}
            <Route
              path="/operations/tracking"
              element={<ShipmentTrackingMilestones />}
            />
            <Route path="/user/dashboard" element={<UserDashboard />} />

            {/* Bills &  Payment*/}
            <Route path="/billing/invoices" element={<Invoices />} />
            <Route path="/billing/payments" element={<Payments />} />
            <Route path="/billing/disputes" element={<Disputes />} />
            <Route path="/billing/subscription" element={<Subscription />} />
            {/* Cms management */}
            <Route path="/cms/articles" element={<ManageArticles />} />
            <Route path="/cms/knowledge" element={<Knowledge />} />

            {/* notifiction */}
            <Route path="/notifications" element={<Notifications />} />
            {/* Forms */}
            <Route path="/form-elements" element={<FormElements />} />

            {/* Tables */}
            <Route path="/basic-tables" element={<BasicTables />} />
            <Route path="/quoterate/book" element={<QuoteAndBook />} />
            <Route path="/user/export" element={<ExportPage />} />
            <Route path="/user/import" element={<ImportPage />} />
            <Route path="/user/finance" element={<FinancePage />} />
            <Route path="/user/settings" element={<UserSettingsPage />} />

            {/* Ui Elements */}
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/avatars" element={<Avatars />} />
            <Route path="/badge" element={<Badges />} />
            <Route path="/buttons" element={<Buttons />} />
            <Route path="/images" element={<Images />} />
            <Route path="/videos" element={<Videos />} />

            {/* Charts */}
            <Route path="/line-chart" element={<LineChart />} />
            <Route path="/bar-chart" element={<BarChart />} />
          </Route>

          {/* Auth Layout */}
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />

          {/* Fallback Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </>
  );
}
