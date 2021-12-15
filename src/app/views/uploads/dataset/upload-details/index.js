import { connect } from "react-redux";
import DatasetUploadDetails from "./DatasetUploadDetails";

const mapStateToProps = state => {
  return {
      datasets: state.state.datasets.all,
      jobs: state.state.datasets.jobs,
  };
};

export default connect(mapStateToProps)(DatasetUploadController);
