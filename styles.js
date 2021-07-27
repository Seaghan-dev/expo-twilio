export default {
  container: {
    flex: 1,
    backgroundColor: "white",
    padding: 16,
  },
  callContainer: {
    flex: 1,
  },
  welcome: {
    fontSize: 30,
    textAlign: "center",
    paddingTop: 40,
  },
  input: {
    // backgroundColor: "gray",
    borderWidth: 1,
    borderColor: "gray",
    paddingHorizontal: 8,
    paddingVertical: 12,
  },
  button: {
    paddingVertical: 16,
    paddingHorizontal: 12,
    marginHorizontal: 8,
  },
  localVideo: {
    flex: 1,
    width: 150,
    height: 250,
    position: "absolute",
    right: 10,
    bottom: 10,
  },
  remoteGrid: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
  },
  remoteVideo: {
    marginTop: 20,
    marginLeft: 10,
    marginRight: 10,
    width: 140,
    height: 160,
  },
  optionsContainer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "flex-start",
  },
  optionButton: {
    backgroundColor: "black",
    paddingVertical: 16,
    paddingHorizontal: 12,
    marginHorizontal: 8,
    marginRight: 8,
  },
};
