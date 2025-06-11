"use client";

import React from "react";
import withAuth from "../../hocs/withAuth";
import Dashboard from "./DashboardPage";

function DashboardPage() {
  return <Dashboard />;
}

export default withAuth(DashboardPage);
