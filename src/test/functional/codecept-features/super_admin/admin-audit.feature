#Audit tests requires opening hours tab on to run
@fact-admin-tab-opening-hours
Feature: courts audits

#  Scenario: view audits for super admin user
#    Given a court is created through the API
#    When I log in as a super-admin
#    When I click edit next to the test court
#    Then I am redirected to the Edit Court page for the chosen court
#    When I hover over opening hours nav element
#    When I click the opening hours tab
#    Then I check action start time
#    When I enter a new opening hours entry by selecting description "Counter open" and adding hours "10:00am to 4:00pm"
#    And I click save
#    Then a green update message is displayed in the opening hours tab
#    When I remove all existing opening hours entries and save
#    Then a green update message is displayed in the opening hours tab
#    Then I check action end time
#    Then I click on courts link
#    When I click on audits link
#    Then I select test court from courts
#      #Then I select "havant-justice-centre" from courts
#    Then I enter between and end date
#    Then I click search audit button
#    Then I can see the expected audits
#    And the court is cleaned up through the API
#
