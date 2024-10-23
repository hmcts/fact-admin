Feature: Court region

  Scenario: View the list of courts regions
    When I log in as an admin
    Then I can view the courts regions
    When I select the region Yorkshire and the Humber "9"
    Then I can see the courts "bradford-combined-court-centre" and "leeds-combined-court-centre" in the list
